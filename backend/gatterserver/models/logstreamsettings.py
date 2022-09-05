"""Add a device or stream."""

from typing import Literal

from gatterserver.models.gatterbasemodel import GatterBaseModel


class LogStreamSettings(GatterBaseModel):
    """Set the log level streamed from backend to GUI."""

    level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
