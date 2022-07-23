"""Add a device or stream."""

from gatterserver.models.gatterbasemodel import GatterBaseModel


class Connect(GatterBaseModel):
    """Connec to a BLE device."""

    deviceId: int = None
