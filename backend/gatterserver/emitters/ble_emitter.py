"""Define a BLE Emitter."""

import asyncio
import logging
from asyncio.exceptions import TimeoutError
from typing import Awaitable, Dict, List, Union
from uuid import UUID

from bleak import BleakClient
from bleak.backends.service import BleakGATTCharacteristic, BleakGATTService
from bleak.exc import BleakError

from gatterserver import models
from gatterserver.emitters.emitter import Emitter, Stream

LOGGER = logging.getLogger(__name__)


class BLEEmitter(Emitter):
    def __init__(self, device_id: int, address: str):
        super().__init__(device_id)
        self._address = address
        self._client = BleakClient(address)
        self._services: Dict[int, BleakGATTService] = {}
        self._characteristics: Dict[int, BleakGATTCharacteristic] = {}

        self._streams = []

    async def connect(self) -> bool:
        try:
            self._connected = await self.bc.connect(timeout=30.0)
        except (BleakError, TimeoutError):
            return False
        
        LOGGER.info("Connected to %s", self._address)

        if not self._connected:
            return False

        service_container = await self.bc.get_services()
        LOGGER.info("%s", service_container)
        # self._services = service_container.services
        self._characteristics = service_container.characteristics

        return True
    
    async def read(self, char_specifier: Union[int, str, UUID]) -> bytearray:
        return await self.bc.read_gatt_char(char_specifier)

    async def start_stream(self, send: Awaitable):
        async def _task(send: Awaitable):
            while True:
                if self._val > self._max:
                    self._val = self._min
                if self._stop:  # TODO: think about timing and sync
                    self._stop = False
                    break
                await asyncio.gather(
                    send(int.to_bytes(self._val, 4, "little", signed=True)),
                    asyncio.sleep(self._step_interval_s),
                )
                self._val += self._step

    @property
    def address(self) -> str:
        return self._address
    
    @property
    def device_rep(self) -> models.BLEDeviceMessage:
        device_message = models.BLEDeviceMessage(deviceId=self.device_id)

        for service in self.bc.services:
            service_message = models.BLEServiceMessage(uuid=service.uuid)

            for characteristic in service.characteristics:
                characteristic_message = models.BLECharacteristicMessage(
                    uuid=characteristic.uuid,
                    properties=characteristic.properties,
                )

                for descriptor in characteristic.descriptors:
                    descriptor_message = models.BLEDescriptorMessage(
                        uuid=descriptor.uuid,
                        handle=descriptor.handle,
                        description=descriptor.description,
                        characteristic=models.BLECharacteristicReference(
                            uuid=descriptor.characteristic_uuid,
                            handle=descriptor.characteristic_handle
                        )
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
