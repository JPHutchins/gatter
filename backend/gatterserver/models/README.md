# Models

## Add a device or stream

`/api/cmd/add`

```json
{
  "title": "AddCommand",
  "type": "object",
  "properties": {
    "emitterType": {
      "title": "Emittertype",
      "enum": [
        "ramp",
        "ble",
        "serial"
      ],
      "type": "string"
    },
    "deviceId": {
      "title": "Deviceid",
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
  "type": "object",
  "properties": {
    "deviceId": {
      "title": "Deviceid",
      "type": "integer"
    },
    "channelId": {
      "title": "Channelid",
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
  "type": "object",
  "properties": {
    "address": {
      "title": "Address",
      "type": "string"
    },
    "rssi": {
      "title": "Rssi",
      "type": "integer"
    },
    "rssiAverage": {
      "title": "Rssiaverage",
      "type": "number"
    },
    "name": {
      "title": "Name",
      "type": "string"
    },
    "services": {
      "title": "Services",
      "default": [],
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "manufacturerData": {
      "title": "Manufacturerdata",
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
  "type": "object",
  "properties": {
    "discovery": {
      "title": "Discovery",
      "type": "boolean"
    }
  },
  "required": [
    "discovery"
  ],
  "additionalProperties": false
}
```

