"""Define custom logging tools."""

import asyncio
import logging
from collections import deque
from typing import AsyncIterator, Deque

LOG_FORMAT_STRING = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

LOGGER = logging.getLogger(__name__)


class AsyncStreamHandler(logging.Handler):
    """A logging handler that emits to an async generator."""

    def __init__(self):
        super().__init__()

        self._pending_data: Deque[str] = deque([])
        self._semaphore = asyncio.Semaphore(0)

        # set defaults
        self.setFormatter(logging.Formatter(LOG_FORMAT_STRING))
        self.setLevel(logging.DEBUG)

    def emit(self, record):
        try:
            self._pending_data.append(self.format(record))
            self._semaphore.release()
        except Exception as e:
            LOGGER.exception("Exception while sending data to queue.")
            raise e

    async def receive(self) -> AsyncIterator[str]:
        while True:
            await self._semaphore.acquire()
            yield self._pending_data.popleft()
