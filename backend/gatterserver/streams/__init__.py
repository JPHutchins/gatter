"""Define streams and interfaces to streams."""

import asyncio
import logging
import struct
from collections import deque
from typing import AsyncIterator, Awaitable, Callable, Optional

from pydantic import BaseModel  # type: ignore

from gatterserver import models

LOGGER = logging.getLogger(__name__)


class Stream(BaseModel):
    start: Callable[[Optional[Callable[[bytes], Awaitable]]], Awaitable]
    stop: Optional[Callable[[], Awaitable]] = None
    task_handle: Optional[asyncio.Task] = None
    send: Optional[Callable[[bytes], Awaitable]] = None

    class Config:
        arbitrary_types_allowed = True


class StreamPacket:
    """A packet of bytes associated with a particular stream."""

    def __init__(self, stream_id: models.StreamId, raw_data: bytes):
        self._stream_id = stream_id
        self._raw_data = raw_data
        self._raw_data_length = len(raw_data)

        self._byte_array = (
            struct.pack("BBH", stream_id.deviceId, stream_id.channelId, self._raw_data_length)
            + self._raw_data
        )

    @property
    def byte_array(self) -> bytes:
        """The bytes |device_id u8|channel_id u8|length u16|data[0] u8|data[length-1] u8|"""
        return self._byte_array

    @property
    def stream_id(self) -> models.StreamId:
        """The stream ID."""
        return self._stream_id


class StreamManager:
    """Manage streams of data."""

    def __init__(self):
        self._lock = asyncio.Lock()
        self._pending_data = deque([])
        self._semaphore = asyncio.Semaphore(0)
        self._streams = {}

    async def add_stream(self, stream_id: models.StreamId) -> Callable[[bytes], Awaitable]:
        """Register a stream and return an awaitable used to queue packets."""
        async with self._lock:
            if stream_id in self._streams:
                raise Exception(f"{stream_id} already added!")
            self._streams[stream_id] = stream_id

        LOGGER.info(f"{stream_id} added.")

        def _send_wrapper(stream_id: models.StreamId) -> Callable[[bytes], Awaitable]:
            async def _send(data: bytes):
                async with self._lock:
                    try:
                        self._pending_data.append(StreamPacket(stream_id, data))
                        self._semaphore.release()
                    except Exception as e:
                        LOGGER.exception("Exception while sending data to queue.")
                        raise e

            return _send

        return _send_wrapper(stream_id)

    async def remove_stream(self, stream_id: models.StreamId):
        """Remove a stream."""
        async with self._lock:
            if stream_id not in self._streams:
                LOGGER.warning(f"{stream_id} cannot be removed because it does not exist.")
                return
            del self._streams[stream_id]

    async def receive(self) -> AsyncIterator[StreamPacket]:
        while True:
            await self._semaphore.acquire()
            async with self._lock:
                yield self._pending_data.popleft()
