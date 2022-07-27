"""Define the JSON POST routes."""

import logging
import sys

from fastapi import APIRouter, Response, status
from fastapi.encoders import jsonable_encoder
from gatterserver import models
from gatterserver.emitters.ble_emitter import BLEEmitter
from gatterserver.emitters.emittermanager import EmitterManager, EmitterManagerError
from gatterserver.emitters.signalgen import Ramp

LOGGER = logging.getLogger(__name__)

router = APIRouter()

emitter_manager: EmitterManager = None


def register(emitter_manager: EmitterManager):
    this_module = sys.modules[__name__]
    this_module.__dict__["emitter_manager"] = emitter_manager


@router.post(models.API_CMD_ADD_PATH)
async def add(add_command: models.AddCommand, response: Response):
    kwargs = {}
    if add_command.emitterType == models.RAMP_EMITTER_TYPE:
        emitter_class = Ramp
    elif add_command.emitterType == models.BLE_EMITTER_TYPE:
        emitter_class = BLEEmitter
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
async def remove(delete_command: models.DeleteCommand):
    if delete_command.deviceId != None:
        await emitter_manager.unregister(delete_command.deviceId)
        return delete_command
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
async def connect(connect: models.Connect):
    device: BLEEmitter = emitter_manager[connect.deviceId]
    if device == None:
        return {"error": f"Could not get device {connect.deviceId}"}

    connected = await device.connect()
    if not connected:
        return {"error": f"Connection to device {connect.deviceId} failed"}

    return jsonable_encoder(device.device_rep)


@router.post("/api/ble/read/characteristic")
async def read_characteristic(
    read_characteristic: models.ReadCharacteristic,
) -> Response:
    device: BLEEmitter = emitter_manager[read_characteristic.deviceId]
    return Response(
        content=bytes(await device.read_characteristic(read_characteristic.handle))
    )
