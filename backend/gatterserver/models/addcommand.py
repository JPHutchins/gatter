"""Add a device or stream."""

from typing import Literal

from gatterserver.models import const
from gatterserver.models.gatterbasemodel import GatterBaseModel


class AddCommand(GatterBaseModel):
    """Add a device or stream."""

    emitterType: Literal[
        const.RAMP_EMITTER_TYPE, const.BLE_EMITTER_TYPE, const.SERIAL_EMITTER_TYPE
    ]
    deviceId: int = None
