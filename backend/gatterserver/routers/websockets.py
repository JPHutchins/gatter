"""Define the websocket routes."""

import logging
import sys

from fastapi import APIRouter, WebSocket  # type: ignore
from websockets.exceptions import ConnectionClosedOK

from gatterserver.emitters.emittermanager import EmitterManager
from gatterserver.loggers import AsyncStreamHandler

LOGGER = logging.getLogger(__name__)

router = APIRouter()

emitter_manager: EmitterManager = None  # type: ignore
gui_handler: AsyncStreamHandler = None  # type: ignore


def register(emitter_manager: EmitterManager, gui_handler: AsyncStreamHandler):
    this_module = sys.modules[__name__]
    this_module.__dict__["emitter_manager"] = emitter_manager
    this_module.__dict__["gui_handler"] = gui_handler


@router.websocket("/api/ws/streams")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    async for packet in emitter_manager.stream_manager.receive():
        await websocket.send_bytes(packet.byte_array)


@router.websocket("/api/ws/log")
async def log_endpoint(websocket: WebSocket):
    await websocket.accept()

    logging.getLogger().addHandler(gui_handler)

    try:
        async for log in gui_handler.receive():
            await websocket.send_text(log)
    except ConnectionClosedOK:
        LOGGER.info("LogStream WS closed with status code 1000 OK.")
    finally:
        logging.getLogger().removeHandler(gui_handler)
