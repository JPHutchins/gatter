"""Read a GATT characteristic."""

from gatterserver.models.gatterbasemodel import GatterBaseModel


class ReadCharacteristic(GatterBaseModel):
    deviceId: int
    handle: int
