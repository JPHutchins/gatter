"""Define pydantic/JSON models."""

import os

from gatterserver.models.addcommand import AddCommand
from gatterserver.models.bledevicemessage import (
    BLECharacteristicMessage,
    BLECharacteristicReference,
    BLEDescriptorMessage,
    BLEDeviceMessage,
    BLEServiceMessage,
)
from gatterserver.models.blediscoverymessage import BLEDiscoveryMessage
from gatterserver.models.connect import Connect
from gatterserver.models.const import (
    API_CMD_ADD_PATH,
    API_CMD_DEL_PATH,
    API_CMD_START_STREAM_PATH,
    BLE_EMITTER_TYPE,
    RAMP_EMITTER_TYPE,
    SERIAL_EMITTER_TYPE,
)
from gatterserver.models.deletecommand import DeleteCommand
from gatterserver.models.discoverycommand import DiscoveryCommand
from gatterserver.models.readcharacteristic import ReadCharacteristic
from gatterserver.models.startstreamcommand import StartStreamCommand
from gatterserver.models.streamid import StreamId

if __name__ == "__main__":
    # Generate the README.md
    models_list = (
        (AddCommand, API_CMD_ADD_PATH),
        (Connect, "/api/ble/connect"),
        (DeleteCommand, API_CMD_DEL_PATH),
        (StartStreamCommand, API_CMD_START_STREAM_PATH),
        (BLEDiscoveryMessage, "/api/ws/blediscovery"),
        (DiscoveryCommand, "/api/ble/discovery"),
        (StreamId, "object"),
        (BLEDeviceMessage, ""),
        (BLECharacteristicMessage, ""),
        (BLECharacteristicReference, ""),
        (BLEDescriptorMessage, ""),
        (BLEServiceMessage, ""),
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
