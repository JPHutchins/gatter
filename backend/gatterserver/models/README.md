# Models

## Add a device or stream

`/api/cmd/add`

```json
{
  "title": "AddCommand",
  "description": "The default config for Gatter Pyadantic models.",
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

## Remove a device or stream

`/api/cmd/del`

```json
{
  "title": "DeleteCommand",
  "description": "The default config for Gatter Pyadantic models.",
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

## Start a stream

`/api/cmd/stream/start`

```json
{
  "title": "StartStreamCommand",
  "description": "The default config for Gatter Pyadantic models.",
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
      "type": "object",
      "properties": {
        "device_id": {
          "title": "Device Id",
          "type": "integer"
        },
        "channel_id": {
          "title": "Channel Id",
          "type": "integer"
        }
      },
      "required": [
        "device_id",
        "channel_id"
      ]
    }
  }
}
```

## A BLE device has been discovered

`/api/ws/blediscovery`

```json
{
  "title": "BLEDiscoveryMessage",
  "description": "The default config for Gatter Pyadantic models.",
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

## Start or stop BLE discovery

`/api/ble/discovery`

```json
{
  "title": "DiscoveryCommand",
  "description": "The default config for Gatter Pyadantic models.",
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

