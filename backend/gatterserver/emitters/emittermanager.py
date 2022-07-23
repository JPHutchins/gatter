"""Define the EmitterManager."""

import asyncio
import logging
from collections import defaultdict
from typing import Any, Dict, List, Optional

from gatterserver import models
from gatterserver.emitters.emitter import Emitter
from gatterserver.streams import Stream, StreamManager

from . import const

LOGGER = logging.getLogger(__name__)

import sys

root = logging.getLogger()
root.setLevel(logging.INFO)

handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
root.addHandler(handler)


class EmitterManagerError(Exception):
    ...


class EmitterManager:
    """Manage registration of emitters."""

    def __init__(self):
        self._lock = asyncio.Lock()
        self._available_device_id_stack = [
            i for i in range(const.MAX_DEVICE_ID, -1, -1)
        ]
        self._emitters: Dict[int, Emitter] = defaultdict()
        self._stream_manager = StreamManager()
        self._unique_ids = set([])

    async def register_device(self, emitter: Emitter, **kwargs) -> int:
        """Register a new device of the given class and return its id."""
        async with self._lock:
            device_id = self._available_device_id_stack.pop()
            if device_id in self._emitters:
                raise EmitterManagerError(
                    f"Emitter with device_id {device_id} is already registered!"
                )
            if "address" in kwargs.keys():
                if kwargs["address"] in self._unique_ids:
                    raise EmitterManagerError(
                        f"A device with address {kwargs['address']} was already"
                        f" registered!"
                    )
                self._unique_ids.add(kwargs["address"])
            self._emitters[device_id] = emitter(device_id, **kwargs)
            return device_id

    async def start_stream(self, stream_id: models.StreamId):
        """Start the given stream."""
        async with self._lock:
            stream = self._get_stream(stream_id)

            if stream.task_handle != None:
                LOGGER.info(f"{stream_id} was already started.")
                return

            if stream.send == None:
                LOGGER.info(f"Registering {stream_id} with StreamManager.")
                stream.send = await self.stream_manager.add_stream(stream_id)

            stream.task_handle = stream.start(stream.send)
            LOGGER.debug(f"{stream_id} started.")

    async def stop_stream(self, stream_id: models.StreamId):
        """Stop the given stream."""
        async with self._lock:
            stream = self._get_stream(stream_id)

            if stream.task_handle == None:
                LOGGER.info(f"{stream_id} was already stopped.")
                return

            stream.task_handle.cancel()
            stream.task_handle = None
            LOGGER.debug(f"{stream_id} stopped.")

    async def start_all_streams(self, device_id: int):
        """Start all streams of `device_id`."""
        for stream_id, _ in enumerate(self._emitters[device_id].streams):
            await self.start_stream(stream_id)

    async def stop_all_streams(self, device_id: int):
        """Stop all streams of `device_id`."""
        for channel_id, _ in enumerate(self._emitters[device_id].streams):
            stream_id = models.StreamId(deviceId=device_id, channelId=channel_id)
            await self.stop_stream(stream_id)

    async def unregister(self, device_id: int):
        """Unregister a device."""
        async with self._lock:
            if device_id not in self._emitters:
                raise EmitterManagerError(
                    f"Cannot remove emitter with device_id {device_id} because it does not exist."
                )

        await self.stop_all_streams(device_id)

        async with self._lock:
            for channel_id in range(len(self._emitters[device_id].streams)):
                stream_id = models.StreamId(deviceId=device_id, channelId=channel_id)
                await self.stream_manager.remove_stream(stream_id)

            if address := getattr(self._emitters[device_id], "address", None):
                self._unique_ids.remove(address)

            del self._emitters[device_id]
            self._available_device_id_stack.append(device_id)

    async def is_registered(self, device_id: int) -> bool:
        """Return true if device_id has been registered, else false."""
        async with self._lock:
            return device_id in self._emitters

    def _get_streams(self, device_id: int) -> List[Stream]:
        """Helper method.  Only call inside a `async with self._lock:` block."""
        return self._emitters[device_id].streams

    def _get_stream(self, stream_id: models.StreamId) -> Stream:
        """Helper method.  Only call inside a `async with self._lock:` block."""
        try:
            return self._get_streams(stream_id.deviceId)[stream_id.channelId]
        except Exception as e:
            LOGGER.error(e, exc_info=True)
            raise EmitterManagerError(f"Could not get {stream_id}.")

    @property
    def stream_manager(self) -> StreamManager:
        return self._stream_manager
    
    def __getitem__(self, item: Any) -> Optional[Emitter]:
        return self._emitters.get(item)
