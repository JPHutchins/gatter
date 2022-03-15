"""Turn BLE discovery on or off."""

from gatterserver.models.gatterbasemodel import GatterBaseModel


class DiscoveryCommand(GatterBaseModel):
    """Turn BLE discovery on or off."""

    discovery: bool
