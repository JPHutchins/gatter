"""Add a device or stream."""

from typing import Literal

from pydantic import validator

from gatterserver.models import const
from gatterserver.models.gatterbasemodel import GatterBaseModel


class AddCommand(GatterBaseModel):
    """Add a device or stream. Address is required to add a BLE device."""

    emitterType: Literal[
        const.RAMP_EMITTER_TYPE, const.BLE_EMITTER_TYPE, const.SERIAL_EMITTER_TYPE
    ]
    address: str = None
    deviceId: int = None

    @validator("address", pre=True, always=True)
    def address_is_required_for_ble(cls, v, values):
        if values["emitterType"] == const.BLE_EMITTER_TYPE and v == None:
            raise ValueError("address is required when adding a BLE device")
        return v
