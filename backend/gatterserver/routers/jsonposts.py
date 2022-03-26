"""Define the JSON POST routes."""

import logging
import sys

from fastapi import APIRouter, Response, status

from gatterserver import models
from gatterserver.emitters.emittermanager import EmitterManager, EmitterManagerError
from gatterserver.emitters.signalgen import Ramp

LOGGER = logging.getLogger(__name__)

router = APIRouter()

emitter_manager: EmitterManager = None


def register(emitter_manager: EmitterManager):
    sys.modules[__name__].__dict__["emitter_manager"] = emitter_manager


@router.post(models.API_CMD_ADD_PATH)
async def add(add_command: models.AddCommand, response: Response):
    if add_command.emitterType == models.RAMP_EMITTER_TYPE:
        emitter_class = Ramp
    elif add_command.emitterType == models.BLE_EMITTER_TYPE:
        emitter_class = Ramp  # TODO: replace with BLE class
    elif add_command.emitterType == models.SERIAL_EMITTER_TYPE:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": f"emitterType: {add_command.emitterType} not implemented"}
    else:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": f"emitterType: {add_command.emitterType} not matched"}

    device_id = await emitter_manager.register_device(emitter_class)
    add_command.deviceId = device_id
    return add_command


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
