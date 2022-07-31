"""Define a BLE Emitter."""

import logging
from asyncio.exceptions import TimeoutError
from typing import Awaitable, Callable, Dict, List, Optional, Union
from uuid import UUID

from bleak import BleakClient
from bleak.backends.service import BleakGATTCharacteristic, BleakGATTService
from bleak.exc import BleakError

from gatterserver import models
from gatterserver.emitters.emitter import Emitter
from gatterserver.emitters.emittermanager import EmitterManager
from gatterserver.streams import Stream

LOGGER = logging.getLogger(__name__)

DEFAULT_CONNECTION_TIMEOUT = 5.0


class BLEEmitter(Emitter):
    def __init__(self, device_id: int, emitter_manager: EmitterManager, address: str):
        super().__init__(device_id, emitter_manager)
        self._address = address
        self._ble_device_message = models.BLEDeviceMessage(deviceId=self.device_id)
        self._client = BleakClient(address)
        self._services: Dict[int, BleakGATTService] = {}
        self._characteristics: Dict[int, BleakGATTCharacteristic] = {}
        self._streams = {}
        self._next_channel_id = 0

    async def connect(self, timeout: float = DEFAULT_CONNECTION_TIMEOUT) -> bool:
        try:
            connected = await self.bc.connect(timeout=timeout)
        except (BleakError, TimeoutError):
            LOGGER.exception("Exception raised while trying to connect to device.")
            return False
        except OSError:
            LOGGER.warning("OSError while trying to connect.", exc_info=True)
            self._client = BleakClient(self._address)
            connected = await self.bc.connect(timeout=timeout)

        if not connected:
            LOGGER.error("Connection to %s failed.")
            return False

        LOGGER.info("Connected to %s", self._address)

        await self._examine_gatt()

        return True

    async def disconnect(self) -> bool:
        return await self.bc.disconnect()

    async def pair(self, *args, **kwargs) -> bool:
        return await self.bc.pair(*args, **kwargs)

    async def unpair(self) -> bool:
        return await self.bc.unpair()

    async def get_services(self):
        await self.bc.get_services()
        await self._examine_gatt()

    async def read_characteristic(self, char_specifier: Union[int, str, UUID]) -> bytearray:
        try:
            return await self.bc.read_gatt_char(char_specifier)
        except OSError:
            LOGGER.warning("OSError while trying to read from %s", self._address, exc_info=True)
            if await self.connect():
                LOGGER.warning("Able to reconnect to %s.", self._address)
                return await self.bc.read_gatt_char(char_specifier)
            LOGGER.error("Unable to reconnected to %s", self._address)
            return bytearray([])

    async def read_descriptor(self, handle: int, **kwargs) -> bytearray:
        return await self.bc.read_gatt_descriptor(handle, **kwargs)

    async def write_characteristic(
        self,
        char_specifier: Union[int, str, UUID],
        data: bytes,
        write_with_response: bool = False,
    ) -> bool:
        try:
            await self.bc.write_gatt_char(char_specifier, data, write_with_response)
            return True
        except BleakError:
            LOGGER.exception("GATT write failed for device %d", self.device_id)
        return False

    async def write_descriptor(self, handle: int, data: Union[bytes, bytearray, memoryview]):
        return await self.bc.write_gatt_descriptor(handle, data)

    async def start_notify(self, stream_id: models.StreamId, **kwargs):
        if self._streams[stream_id].stop is not None:
            LOGGER.warning("Stream is already running?")
            return
        self._streams[stream_id].stop = await self._streams[stream_id].start(**kwargs)

    async def stop_notify(self, stream_id: models.StreamId):
        if self._streams[stream_id].stop is None:
            LOGGER.warning("Stream isn't running?")
            return
        await self._streams[stream_id].stop()  # type: ignore
        self._streams[stream_id].stop = None

    async def _maybe_register_stream(
        self, characteristic: BleakGATTCharacteristic
    ) -> Optional[models.StreamId]:
        """Register a characteristic as a stream if it supports Notify or Indicate."""

        if (
            "notify" not in characteristic.properties
            and "indicate" not in characteristic.properties
        ):
            return None

        # create a stream ID for this stream
        stream_id = models.StreamId(deviceId=self.device_id, channelId=self._next_channel_id)
        self._next_channel_id += 1

        # register the stream to get the callback that will stream data
        send = await self._em.stream_manager.add_stream(stream_id)

        # make a closure of send and characteristic_handle
        def _make_start(
            send: Callable[[bytes], Awaitable], characteristic_handle: int
        ) -> Callable[[], Awaitable]:
            async def start(
                _: Optional[Callable[[bytes], Awaitable]] = None, **kwargs
            ) -> Callable[[], Awaitable]:
                """Start notifications and return the awaitable to stop them."""

                async def callback(_: int, data: bytearray):
                    await send(data)

                await self.bc.start_notify(characteristic_handle, callback, **kwargs)

                async def stop():
                    return await self.bc.stop_notify(characteristic_handle)

                return stop

            return start

        self._streams[stream_id] = Stream(start=_make_start(send, characteristic.handle), send=send)

        return stream_id

    async def _examine_gatt(self):
        """Iterate the GATT to create a JSONifiable rep and register streams."""

        # first remove all of the old streams
        for stream_id in self._streams.keys():
            self._em.stream_manager.remove_stream(stream_id)
        self._streams = {}
        self._next_channel_id = 0

        for service in self.bc.services:
            service_message = models.BLEServiceMessage(
                uuid=service.uuid,
                handle=service.handle,
                description=service.description,
            )
            for characteristic in service.characteristics:
                characteristic_message = models.BLECharacteristicMessage(
                    uuid=characteristic.uuid,
                    handle=characteristic.handle,
                    properties=characteristic.properties,
                    description=characteristic.description,
                    streamId=await self._maybe_register_stream(characteristic),
                )
                for descriptor in characteristic.descriptors:
                    descriptor_message = models.BLEDescriptorMessage(
                        uuid=descriptor.uuid,
                        handle=descriptor.handle,
                        description=descriptor.description,
                        characteristic=models.BLECharacteristicReference(
                            uuid=descriptor.characteristic_uuid,
                            handle=descriptor.characteristic_handle,
                        ),
                    )
                    characteristic_message.descriptors.append(descriptor_message)
                service_message.characteristics.append(characteristic_message)
            self._ble_device_message.services.append(service_message)

    @property
    def address(self) -> str:
        """The device address."""
        return self._address

    @property
    def bc(self) -> BleakClient:
        """The instance of BleakClient."""
        return self._client

    @property
    def ble_device_message(self) -> models.BLEDeviceMessage:
        """The JSONifiable representation of the GATT."""
        return self._ble_device_message

    @property
    def characteristics_list(self) -> List[str]:
        """The list of characteristics."""
        return [str(UUID(int=int_id)) for int_id in self._characteristics.keys()]

    @property
    def connected(self) -> bool:
        """The connection status."""
        return bool(self.bc.is_connected)
