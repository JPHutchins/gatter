"""Define the websocket routes."""

import logging
import sys

from fastapi import APIRouter, WebSocket

from gatterserver.streams import StreamManager

LOGGER = logging.getLogger(__name__)

router = APIRouter()

stream_manager: StreamManager = None


def register(stream_manager: StreamManager):
    sys.modules[__name__].__dict__["stream_manager"] = stream_manager


@router.websocket("/api/ws/streams")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    async for packet in stream_manager.receive():
        await websocket.send_bytes(packet.byte_array)
