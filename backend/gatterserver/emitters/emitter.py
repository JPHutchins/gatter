"""Define the Emitter interface."""

from abc import ABC
from typing import Dict

from gatterserver import models
from gatterserver.streams import Stream


class Emitter(ABC):
    """A physical or virtual device that emits data on request or asynchronously."""

    def __init__(self, device_id: int, emitter_manager):
        self._device_id = device_id
        self._streams: Dict[models.StreamId, Stream] = {}
        self._em = emitter_manager

    def get_stream(self, stream_id: models.StreamId) -> Stream:
        return self._streams[stream_id]

    async def connect(self, timeout: float = 0) -> bool:
        return True

    async def disconnect(self):
        return

    @property
    def device_id(self) -> int:
        return self._device_id

    @property
    def streams(self) -> Dict[models.StreamId, Stream]:
        return self._streams
