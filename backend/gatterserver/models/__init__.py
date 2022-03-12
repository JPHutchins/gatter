"""Define pydantic/JSON models."""

import os
from base64 import b64encode
from typing import Any, Dict, List, Literal

from gatterserver.streams import StreamId
from pydantic import BaseModel, Extra, validator

API_CMD_ADD_PATH = os.environ["API_CMD_ADD_PATH"]
API_CMD_DEL_PATH = os.environ["API_CMD_DEL_PATH"]
API_CMD_START_STREAM_PATH = os.environ["API_CMD_START_STREAM_PATH"]
RAMP_EMITTER_TYPE = os.environ["RAMP_EMITTER_TYPE"]
BLE_EMITTER_TYPE = os.environ["BLE_EMITTER_TYPE"]
SERIAL_EMITTER_TYPE = os.environ["SERIAL_EMITTER_TYPE"]


class AddCommand(BaseModel, extra=Extra.forbid):
    emitterType: Literal[RAMP_EMITTER_TYPE, BLE_EMITTER_TYPE, SERIAL_EMITTER_TYPE]
    deviceId: int = None


class DeleteCommand(BaseModel, extra=Extra.forbid):
    deviceId: int
    channelId: int = None


class StartStreamCommand(BaseModel, extra=Extra.forbid):
    streamId: StreamId


class BLEDiscoveryMessage(BaseModel, extra=Extra.forbid):
    address: str
    rssi: int
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


class DiscoveryCommand(BaseModel, extra=Extra.forbid):
    discovery: bool


if __name__ == "__main__":
    # Generate the README.md
    models_list = (
        (AddCommand, "Add a device or stream", API_CMD_ADD_PATH),
        (DeleteCommand, "Remove a device or stream", API_CMD_DEL_PATH),
        (StartStreamCommand, "Start a stream", API_CMD_START_STREAM_PATH),
        (
            BLEDiscoveryMessage,
            "A BLE device has been discovered",
            "/api/ws/blediscovery",
        ),
        (DiscoveryCommand, "Start or stop BLE discovery", "/api/ble/discovery"),
    )

    with open(f"{os.path.dirname(os.path.realpath(__file__))}/README.md", "w+") as file:
        file.write("# Models\n\n")

        for model, title, description in models_list:
            schema = model.schema()
            file.write(f"## {title}\n\n")
            file.write(f"`{description}`\n\n")
            file.write("```json\n")
            file.write(model.schema_json(indent=2))
            file.write("\n```\n\n")
