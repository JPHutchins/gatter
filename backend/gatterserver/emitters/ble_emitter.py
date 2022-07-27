"""Define a BLE Emitter."""

import asyncio
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
from gatterserver.streams import Stream, StreamPacket

LOGGER = logging.getLogger(__name__)


class BLEEmitter(Emitter):
    def __init__(self, device_id: int, emitter_manager: EmitterManager, address: str):
        super().__init__(device_id, emitter_manager)
        self._address = address
        self._client = BleakClient(address)
        self._services: Dict[int, BleakGATTService] = {}
        self._characteristics: Dict[int, BleakGATTCharacteristic] = {}

        self._streams = {}
        self._next_channel_id = 0

    async def connect(self) -> bool:
        try:
            self._connected = await self.bc.connect(timeout=30.0)
        except (BleakError, TimeoutError):
            return False

        LOGGER.info("Connected to %s", self._address)

        if not self._connected:
            return False

        return True

    async def disconnect(self) -> bool:
        return await self.bc.disconnect()

    async def pair(self, *args, **kwargs) -> bool:
        return await self.bc.pair(*args, **kwargs)

    async def unpair(self) -> bool:
        return await self.bc.unpair()

    async def get_services(self):
        await self.bc.get_services()

    async def read_characteristic(
        self, char_specifier: Union[int, str, UUID]
    ) -> bytearray:
        return await self.bc.read_gatt_char(char_specifier)

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

    async def write_descriptor(
        self, handle: int, data: Union[bytes, bytearray, memoryview]
    ) -> None:
        return self.bc.write_gatt_descriptor(handle, data)

    async def start_notify(self, stream_id: models.StreamId, **kwargs):
        if self._streams[stream_id].stop is not None:
            LOGGER.warning("Stream is already running!")
            return
        self._streams[stream_id].stop = await self._streams[stream_id].start(**kwargs)

    async def stop_notify(self, stream_id: models.StreamId):
        if self._streams[stream_id].stop is None:
            LOGGER.warning("Stream isn't running?")
            return
        await self._streams[stream_id].stop()

    def _maybe_register_stream(
        self, characteristic: BleakGATTCharacteristic
    ) -> Optional[models.StreamId]:
        """Register a characteristic as a stream if it supports Notify or Indicate."""

        if (
            "notify" not in characteristic.properties
            and "indicate" not in characteristic.properties
        ):
            return None

        # create a stream ID for this stream
        stream_id = models.StreamId(
            deviceId=self.device_id, channelId=self._next_channel_id
        )
        self._next_channel_id += 1

        # register the stream to get the callback that will stream data
        send = self._em.stream_manager.add_stream(stream_id)

        # make a closure of send and characteristic_handle
        def _make_start(
            send: Awaitable, characteristic_handle: int
        ) -> Callable[..., Awaitable]:
            async def start(**kwargs) -> Callable[[], Awaitable]:
                async def callback(_: int, data: bytearray):
                    await send(data)

                await self.bc.start_notify(characteristic_handle, callback, **kwargs)

                def stop():
                    return asyncio.ensure_future(
                        self.bc.stop_notify(characteristic_handle)
                    )

                return stop

            return start

        self._streams[stream_id] = Stream(
            start=_make_start(send, characteristic.handle)
        )

    @property
    def address(self) -> str:
        return self._address

    @property
    def device_rep(self) -> models.BLEDeviceMessage:
        device_message = models.BLEDeviceMessage(deviceId=self.device_id)

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
                    streamId=self._maybe_register_stream(characteristic),
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

            device_message.services.append(service_message)

        LOGGER.info(device_message)
        return device_message

    @property
    def bc(self) -> BleakClient:
        """The instance of BleakClient."""
        return self._client

    @property
    def characteristics_list(self) -> List[str]:
        """The list of characteristics."""
        return [str(UUID(int=int_id)) for int_id in self._characteristics.keys()]
