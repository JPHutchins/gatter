"""Define the websocket routes."""

import logging
import sys

from fastapi import APIRouter, WebSocket

from gatterserver.emitters.emittermanager import EmitterManager

LOGGER = logging.getLogger(__name__)

router = APIRouter()

emitter_manager: EmitterManager = None


def register(emitter_manager: EmitterManager):
    sys.modules[__name__].__dict__["emitter_manager"] = emitter_manager


@router.websocket("/api/ws/streams")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    async for packet in emitter_manager.stream_manager.receive():
        await websocket.send_bytes(packet.byte_array)
