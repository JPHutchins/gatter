"""Message sent when a BLE device is discovered."""

from base64 import b64encode
from typing import Dict, List

from pydantic import validator

from gatterserver.models.gatterbasemodel import GatterBaseModel


class BLEDiscoveryMessage(GatterBaseModel):
    """Message sent when a BLE device is discovered."""

    address: str
    rssi: int
    rssiAverage: float
    name: str = None
    services: List[str] = []
    manufacturerData: Dict[int, bytes] = {}

    @validator("manufacturerData", pre=True)
    def decode_bytes(cls, v: Dict[int, bytes]):
        for key, value in v.items():
            if type(value) != bytes:
                continue
            v[key] = b64encode(value)
        return v
