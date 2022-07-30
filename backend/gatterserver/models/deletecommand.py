"""Remove a device or stream."""

from typing import Optional

from gatterserver.models.gatterbasemodel import GatterBaseModel


class DeleteCommand(GatterBaseModel):
    """Remove a device or stream."""

    deviceId: int
    channelId: Optional[int] = None
