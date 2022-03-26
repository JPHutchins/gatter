# Models

## AddCommand

`/api/cmd/add`

Add a device or stream. Address is required to add a BLE device.

```json
{
  "title": "AddCommand",
  "description": "Add a device or stream. Address is required to add a BLE device.",
  "type": "object",
  "properties": {
    "emitterType": {
      "enum": [
        "ramp",
        "ble",
        "serial"
      ],
      "type": "string"
    },
    "address": {
      "type": "string"
    },
    "deviceId": {
      "type": "integer"
    }
  },
  "required": [
    "emitterType"
  ],
  "additionalProperties": false
}
```

## DeleteCommand

`/api/cmd/del`

Remove a device or stream.

```json
{
  "title": "DeleteCommand",
  "description": "Remove a device or stream.",
  "type": "object",
  "properties": {
    "deviceId": {
      "type": "integer"
    },
    "channelId": {
      "type": "integer"
    }
  },
  "required": [
    "deviceId"
  ],
  "additionalProperties": false
}
```

## StartStreamCommand

`/api/cmd/stream/start`

Start a stream.

```json
{
  "title": "StartStreamCommand",
  "description": "Start a stream.",
  "type": "object",
  "properties": {
    "streamId": {
      "$ref": "#/definitions/StreamId"
    }
  },
  "required": [
    "streamId"
  ],
  "additionalProperties": false,
  "definitions": {
    "StreamId": {
      "title": "StreamId",
      "description": "The unique 16-bit ID `| uint8 deviceId | uint8 channelId |`.",
      "type": "object",
      "properties": {
        "deviceId": {
          "type": "integer"
        },
        "channelId": {
          "type": "integer"
        }
      },
      "required": [
        "deviceId",
        "channelId"
      ],
      "additionalProperties": false
    }
  }
}
```

## BLEDiscoveryMessage

`/api/ws/blediscovery`

Message sent when a BLE device is discovered.

```json
{
  "title": "BLEDiscoveryMessage",
  "description": "Message sent when a BLE device is discovered.",
  "type": "object",
  "properties": {
    "address": {
      "type": "string"
    },
    "rssi": {
      "type": "integer"
    },
    "rssiAverage": {
      "type": "number"
    },
    "name": {
      "type": "string"
    },
    "services": {
      "default": [],
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "manufacturerData": {
      "default": {},
      "type": "object",
      "additionalProperties": {
        "type": "string",
        "format": "binary"
      }
    }
  },
  "required": [
    "address",
    "rssi",
    "rssiAverage"
  ],
  "additionalProperties": false
}
```

## DiscoveryCommand

`/api/ble/discovery`

Turn BLE discovery on or off.

```json
{
  "title": "DiscoveryCommand",
  "description": "Turn BLE discovery on or off.",
  "type": "object",
  "properties": {
    "discovery": {
      "type": "boolean"
    }
  },
  "required": [
    "discovery"
  ],
  "additionalProperties": false
}
```

## StreamId

`object`

The unique 16-bit ID `| uint8 deviceId | uint8 channelId |`.

```json
{
  "title": "StreamId",
  "description": "The unique 16-bit ID `| uint8 deviceId | uint8 channelId |`.",
  "type": "object",
  "properties": {
    "deviceId": {
      "type": "integer"
    },
    "channelId": {
      "type": "integer"
    }
  },
  "required": [
    "deviceId",
    "channelId"
  ],
  "additionalProperties": false
}
```

