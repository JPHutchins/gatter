"""Representation of a BLE device and its capabilities."""

from typing import List, Optional

from gatterserver.models.gatterbasemodel import GatterBaseModel
from gatterserver.models.streamid import StreamId


class BLECharacteristicReference(GatterBaseModel):
    """Nested reference to a parent characteristic."""

    uuid: str
    handle: int


class BLEDescriptorMessage(GatterBaseModel):
    """A descriptor of a BLE characteristic."""

    uuid: str
    handle: int
    description: str
    characteristic: BLECharacteristicReference


class BLECharacteristicMessage(GatterBaseModel):
    """The BLE characteristic's properties."""

    uuid: str
    handle: int
    description: str
    properties: List[str]
    descriptors: List[BLEDescriptorMessage] = []
    streamId: Optional[StreamId] = None


class BLEServiceMessage(GatterBaseModel):
    """The BLE service's characteristics."""

    uuid: str
    handle: int
    description: str
    characteristics: List[BLECharacteristicMessage] = []


class BLEDeviceMessage(GatterBaseModel):
    """The BLE device's capabilities."""

    deviceId: int
    services: List[BLEServiceMessage] = []
