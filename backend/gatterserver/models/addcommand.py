"""Add a device or stream."""

from typing import Literal, Optional

from pydantic import validator  # type: ignore

from gatterserver.models import const
from gatterserver.models.gatterbasemodel import GatterBaseModel
from gatterserver.models.streamid import StreamId


class AddCommand(GatterBaseModel):
    """Add a device or stream. Address is required to add a BLE device."""

    emitterType: Literal["ramp", "ble", "serial"]
    address: Optional[str] = None
    deviceId: Optional[int] = None
    streamId: Optional[StreamId] = None

    @validator("address", pre=True, always=True)
    def address_is_required_for_ble(cls, v, values):
        if values["emitterType"] == const.BLE_EMITTER_TYPE and v is None:
            raise ValueError("address is required when adding a BLE device")
        return v
