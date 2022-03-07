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

