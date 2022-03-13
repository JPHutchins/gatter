"""Define pydantic/JSON models."""

import os
from base64 import b64encode
from typing import Any, Dict, List, Literal

from pydantic import BaseModel, Extra, validator

from gatterserver.streams import StreamId

API_CMD_ADD_PATH = os.environ["API_CMD_ADD_PATH"]
API_CMD_DEL_PATH = os.environ["API_CMD_DEL_PATH"]
API_CMD_START_STREAM_PATH = os.environ["API_CMD_START_STREAM_PATH"]
RAMP_EMITTER_TYPE = os.environ["RAMP_EMITTER_TYPE"]
BLE_EMITTER_TYPE = os.environ["BLE_EMITTER_TYPE"]
SERIAL_EMITTER_TYPE = os.environ["SERIAL_EMITTER_TYPE"]


class GatterBaseModel(BaseModel):
    """The default base class for Gatter Pyadantic models."""

    class Config:
        """The default config for Gatter Pyadantic models."""

        extra = Extra.forbid

        @staticmethod
        def schema_extra(schema: Dict[str, Any], model: BaseModel) -> None:
            for prop in schema.get("properties", {}).values():
                prop.pop("title", None)


class AddCommand(GatterBaseModel):
    """Add a device or stream."""

    emitterType: Literal[RAMP_EMITTER_TYPE, BLE_EMITTER_TYPE, SERIAL_EMITTER_TYPE]
    deviceId: int = None


class DeleteCommand(GatterBaseModel):
    """Remove a device or stream."""

    deviceId: int
    channelId: int = None


class StartStreamCommand(GatterBaseModel):
    """Start a stream."""

    streamId: StreamId


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


class DiscoveryCommand(GatterBaseModel):
    """Turn BLE discovery on or off."""

    discovery: bool


if __name__ == "__main__":
    # Generate the README.md
    models_list = (
        (AddCommand, API_CMD_ADD_PATH),
        (DeleteCommand, API_CMD_DEL_PATH),
        (StartStreamCommand, API_CMD_START_STREAM_PATH),
        (BLEDiscoveryMessage, "/api/ws/blediscovery"),
        (DiscoveryCommand, "/api/ble/discovery"),
    )

    with open(f"{os.path.dirname(os.path.realpath(__file__))}/README.md", "w+") as file:
        file.write("# Models\n\n")

        for model, path in models_list:
            schema = model.schema()
            file.write(f"## {schema['title']}\n\n")
            file.write(f"`{path}`\n\n")
            file.write(f"{schema['description']}\n\n")
            file.write("```json\n")
            file.write(model.schema_json(indent=2))
            file.write("\n```\n\n")
