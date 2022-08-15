"""Define the JSON POST routes."""

import logging
import sys
from typing import Optional

from bleak import BleakError
from fastapi import APIRouter, Response, status
from fastapi.encoders import jsonable_encoder

from gatterserver import models
from gatterserver.emitters.ble_emitter import BLEEmitter
from gatterserver.emitters.emitter import Emitter
from gatterserver.emitters.emittermanager import EmitterManager, EmitterManagerError
from gatterserver.emitters.signalgen import Ramp
from gatterserver.loggers import AsyncStreamHandler

LOGGER = logging.getLogger(__name__)

router = APIRouter()

emitter_manager: EmitterManager = None  # type: ignore
gui_handler: AsyncStreamHandler = None  # type: ignore


def register(emitter_manager: EmitterManager, gui_handler: AsyncStreamHandler):
    this_module = sys.modules[__name__]
    this_module.__dict__["emitter_manager"] = emitter_manager
    this_module.__dict__["gui_handler"] = gui_handler


@router.post(models.API_CMD_ADD_PATH)
async def add(add_command: models.AddCommand, response: Response):
    kwargs = {}
    if add_command.emitterType == models.RAMP_EMITTER_TYPE:
        emitter_class = Ramp
    elif add_command.emitterType == models.BLE_EMITTER_TYPE:
        emitter_class = BLEEmitter  # type: ignore
        kwargs = {"address": add_command.address}
    elif add_command.emitterType == models.SERIAL_EMITTER_TYPE:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": f"emitterType: {add_command.emitterType} not implemented"}
    else:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": f"emitterType: {add_command.emitterType} not matched"}

    try:
        device_id = await emitter_manager.register_device(emitter_class, **kwargs)
        add_command.deviceId = device_id
        return add_command
    except EmitterManagerError:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": "device already added"}


@router.post(models.API_CMD_DEL_PATH)
async def remove(delete_command: models.DeleteCommand, response: Response):
    if delete_command.deviceId is not None:
        await emitter_manager.unregister(delete_command.deviceId)
        return delete_command
    response.status_code = status.HTTP_400_BAD_REQUEST
    return {"msg": "error"}


@router.post(models.API_CMD_START_STREAM_PATH)
async def start_stream(start_command: models.StartStreamCommand, response: Response):
    try:
        await emitter_manager.start_stream(start_command.streamId)
        return start_command
    except EmitterManagerError:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": f"Could not get {start_command.streamId}"}


@router.post("/api/ble/connect")
async def connect(connect: models.Connect, response: Response):
    device: Optional[Emitter] = emitter_manager[connect.deviceId]

    if device is None:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": f"Could not get device {connect.deviceId}"}

    if type(device) != BLEEmitter:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": f"Device {connect.deviceId} is not a BLE device"}

    connected = await device.connect()

    if not connected:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"error": f"Connection to device {connect.deviceId} failed"}

    return jsonable_encoder(device.ble_device_message)


@router.post("/api/ble/read/characteristic")
async def read_characteristic(read_characteristic: models.ReadCharacteristic, response: Response):
    device = emitter_manager[read_characteristic.deviceId]

    if device is None:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": f"Could not get device {read_characteristic.deviceId}"}

    if type(device) != BLEEmitter:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": f"Device {read_characteristic.deviceId} is not a BLE device"}

    try:
        return Response(content=bytes(await device.read_characteristic(read_characteristic.handle)))
    except BleakError:
        LOGGER.exception("Exception during read.")
        return Response(content=bytes([]))


@router.post("/api/dev/logStreamSettings")
async def log_level(log_stream_settings: models.LogStreamSettings):
    gui_handler.setLevel(log_stream_settings.level)
    return log_stream_settings
