"""Define streams and interfaces to streams."""

import asyncio
import logging
import struct
from collections import deque
from typing import Awaitable

from pydantic import BaseModel, validator

LOGGER = logging.getLogger(__name__)

MAXIMUM_PENDING_PACKETS = 10


class StreamId(BaseModel):
    device_id: int
    stream_id: int

    @validator("device_id", "stream_id")
    def must_be_uint8_t(cls, v):
        if v < 0 or v > 0xFF:
            raise ValueError("IDs must be uint8_t, 0-255")
        return v

    def __hash__(self):
        return (self.__dict__["device_id"] << 8) | self.__dict__["stream_id"]


class StreamPacket:
    """A packet of bytes associated with a particular stream."""

    def __init__(self, stream: StreamId, raw_data: bytes):
        self._stream = stream
        self._raw_data = raw_data
        self._raw_data_length = len(raw_data)

        self._byte_array = (
            struct.pack(
                "BBH", stream.device_id, stream.stream_id, self._raw_data_length
            )
            + self._raw_data
        )

    @property
    def byte_array(self) -> bytes:
        """The bytes | device_id u8 | stream_id u8 | length u16 | data[0] u8 | data[length-1] u8 |"""
        return self._byte_array

    @property
    def stream(self) -> StreamId:
        """The stream ID."""
        return self._stream


class StreamManager:
    """Manage streams of data."""

    def __init__(self):
        self._lock = asyncio.Lock()
        self._pending_data = deque([])
        self._semaphore = asyncio.Semaphore(0)
        self._streams = {}

    def add_stream(self, stream_id: StreamId) -> Awaitable:
        """Register a stream and return an awaitable used to queue packets."""
        if stream_id in self._streams:
            raise Exception(f"{stream_id} already added!")
        self._streams[stream_id] = stream_id

        LOGGER.info(f"{stream_id} added.")

        def _send_wrapper(stream_id: StreamId) -> Awaitable:
            async def _send(data: bytes):
                async with self._lock:
                    try:
                        self._pending_data.append(StreamPacket(stream_id, data))
                        self._semaphore.release()
                    except Exception as e:
                        LOGGER.critical(e, exc_info=True)

            return _send

        return _send_wrapper(stream_id)

    def remove_stream(self, stream_id: StreamId):
        """Remove a stream."""
        if stream_id not in self._streams:
            LOGGER.warning(f"{stream_id} cannot be removed because it does not exist.")
            return
        del self._streams[stream_id]

    async def receive(self) -> StreamPacket:
        while True:
            await self._semaphore.acquire()
            async with self._lock:
                yield self._pending_data.popleft()
