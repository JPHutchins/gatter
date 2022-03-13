"""Routes for BLE discovery and connection."""

import logging
import sys

from fastapi import APIRouter, WebSocket
from fastapi.encoders import jsonable_encoder
from gatterserver import models
from gatterserver.ble.discovery import BLEDiscoveryManager

LOGGER = logging.getLogger(__name__)

router = APIRouter()

discovery_manager: BLEDiscoveryManager = None


def register(discovery_manager: BLEDiscoveryManager):
    sys.modules[__name__].__dict__["discovery_manager"] = discovery_manager


@router.websocket("/api/ws/blediscovery")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    async for device in discovery_manager.receive():
        discovery_message = models.BLEDiscoveryMessage(
            address=device.address,
            name=device.name,
            rssi=device.rssi,
            rssiAverage=discovery_manager.get_average_rssi(device.address),
            services=device.metadata["uuids"],
            manufacturerData=device.metadata["manufacturer_data"],
        )
        await websocket.send_json(jsonable_encoder(discovery_message))


@router.post("/api/ble/discovery")
async def ble_discovery_endpoint(command: models.DiscoveryCommand):
    if command.discovery:
        await discovery_manager.start_discovery()
    else:
        await discovery_manager.stop_discovery()
    return command
