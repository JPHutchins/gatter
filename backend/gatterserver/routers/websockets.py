"""Define the websocket routes."""

import asyncio
import logging
import sys
from collections import deque
from typing import AsyncIterator, Deque

from fastapi import APIRouter, WebSocket  # type: ignore

from gatterserver.emitters.emittermanager import EmitterManager

LOG_FORMAT_STRING = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

LOGGER = logging.getLogger(__name__)

router = APIRouter()

emitter_manager: EmitterManager = None  # type: ignore


def register(emitter_manager: EmitterManager):
    this_module = sys.modules[__name__]
    this_module.__dict__["emitter_manager"] = emitter_manager


@router.websocket("/api/ws/streams")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    async for packet in emitter_manager.stream_manager.receive():
        await websocket.send_bytes(packet.byte_array)


@router.websocket("/api/ws/log")
async def log_endpoint(websocket: WebSocket):
    await websocket.accept()

    class WebSocketHandler(logging.Handler):
        """A logging handler that emits records with websockets."""

        def __init__(self, websocket: WebSocket):
            super().__init__()

            self._websocket = websocket

            self._pending_data: Deque[str] = deque([])
            self._semaphore = asyncio.Semaphore(0)

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

    gui_handler = WebSocketHandler(websocket)
    gui_handler.setLevel(logging.DEBUG)
    gui_handler.setFormatter(logging.Formatter(LOG_FORMAT_STRING))

    logging.getLogger().addHandler(gui_handler)

    async for log in gui_handler.receive():
        await websocket.send_text(log)
