"""Remove a device or stream."""

from gatterserver.models.gatterbasemodel import GatterBaseModel


class DeleteCommand(GatterBaseModel):
    """Remove a device or stream."""

    deviceId: int
    channelId: int = None
