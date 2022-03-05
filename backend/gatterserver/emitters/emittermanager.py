"""Define the EmitterManager."""

import asyncio

from . import const


class EmitterManager:
    """Manage registration of emitters."""

    def __init__(self):
        self._lock = asyncio.Lock()
        self._available_device_id_stack = [
            i for i in range(const.MAX_DEVICE_ID, -1, -1)
        ]
        self._emitters = {}

    async def register(self) -> int:
        """Register a new emitter and return its id."""
        async with self._lock:
            device_id = self._available_device_id_stack.pop()
            if device_id in self._emitters:
                raise Exception(
                    f"Emitter with device_id {device_id} is already registered!"
                )
            self._emitters[device_id] = True  # This can be used for more info
            return device_id

    async def unregister(self, device_id: int):
        """Unregister a registered emitter."""
        async with self._lock:
            if device_id not in self._emitters:
                raise Exception(
                    f"Cannot remove emitter with device_id {device_id} because it does not exist."
                )
            del self._emitters[device_id]
            self._available_device_id_stack.append(device_id)

    async def is_registered(self, device_id: int) -> bool:
        """Return true if device_id has been registered, else false."""
        async with self._lock:
            return device_id in self._emitters
