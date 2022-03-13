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
async def add(add_command: models.AddCommand):
    if add_command.emitterType == models.RAMP_EMITTER_TYPE:
        device_id = await emitter_manager.register_device(Ramp)
        add_command.deviceId = device_id
        return add_command
    return {"msg": "error"}


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
