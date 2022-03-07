"""Define the Emitter interface."""

from abc import ABC
from typing import List

from gatterserver.streams import Stream


class Emitter(ABC):
    """A physical or virtual device that emits data on request or asynchronously."""

    def __init__(self, device_id: int):
        self._device_id = device_id
        self._streams: List[Stream] = []

    def get_stream(self, channel_id: int) -> Stream:
        return self._streams[channel_id]

    @property
    def device_id(self) -> int:
        return self._device_id

    @property
    def streams(self) -> List[Stream]:
        return self._streams
