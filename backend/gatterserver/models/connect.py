"""Add a device or stream."""

from typing import Optional

from gatterserver.models.gatterbasemodel import GatterBaseModel


class Connect(GatterBaseModel):
    """Connec to a BLE device."""

    deviceId: Optional[int] = None
