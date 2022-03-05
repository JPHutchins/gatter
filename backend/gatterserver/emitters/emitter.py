"""Define the Emitter interface."""

from abc import ABC


class Emitter(ABC):
    """A physical or virtual device that emits data on request or asynchronously."""

    def __init__(self, device_id: int):
        self._device_id = device_id

    @property
    def device_id(self) -> int:
        return self._device_id
