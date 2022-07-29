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

## Connect

`/api/ble/connect`

Connec to a BLE device.

```json
{
  "title": "Connect",
  "description": "Connec to a BLE device.",
  "type": "object",
  "properties": {
    "deviceId": {
      "type": "integer"
    }
  },
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

## BLEDeviceMessage

``

The BLE device's capabilities.

```json
{
  "title": "BLEDeviceMessage",
  "description": "The BLE device's capabilities.",
  "type": "object",
  "properties": {
    "deviceId": {
      "type": "integer"
    },
    "services": {
      "default": [],
      "type": "array",
      "items": {
        "$ref": "#/definitions/BLEServiceMessage"
      }
    }
  },
  "required": [
    "deviceId"
  ],
  "additionalProperties": false,
  "definitions": {
    "BLECharacteristicReference": {
      "title": "BLECharacteristicReference",
      "description": "Nested reference to a parent characteristic.",
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string"
        },
        "handle": {
          "type": "integer"
        }
      },
      "required": [
        "uuid",
        "handle"
      ],
      "additionalProperties": false
    },
    "BLEDescriptorMessage": {
      "title": "BLEDescriptorMessage",
      "description": "A descriptor of a BLE characteristic.",
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string"
        },
        "handle": {
          "type": "integer"
        },
        "description": {
          "type": "string"
        },
        "characteristic": {
          "$ref": "#/definitions/BLECharacteristicReference"
        }
      },
      "required": [
        "uuid",
        "handle",
        "description",
        "characteristic"
      ],
      "additionalProperties": false
    },
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
    },
    "BLECharacteristicMessage": {
      "title": "BLECharacteristicMessage",
      "description": "The BLE characteristic's properties.",
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string"
        },
        "handle": {
          "type": "integer"
        },
        "description": {
          "type": "string"
        },
        "properties": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "descriptors": {
          "default": [],
          "type": "array",
          "items": {
            "$ref": "#/definitions/BLEDescriptorMessage"
          }
        },
        "streamId": {
          "$ref": "#/definitions/StreamId"
        }
      },
      "required": [
        "uuid",
        "handle",
        "description",
        "properties"
      ],
      "additionalProperties": false
    },
    "BLEServiceMessage": {
      "title": "BLEServiceMessage",
      "description": "The BLE service's characteristics.",
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string"
        },
        "handle": {
          "type": "integer"
        },
        "description": {
          "type": "string"
        },
        "characteristics": {
          "default": [],
          "type": "array",
          "items": {
            "$ref": "#/definitions/BLECharacteristicMessage"
          }
        }
      },
      "required": [
        "uuid",
        "handle",
        "description"
      ],
      "additionalProperties": false
    }
  }
}
```

## BLECharacteristicMessage

``

The BLE characteristic's properties.

```json
{
  "title": "BLECharacteristicMessage",
  "description": "The BLE characteristic's properties.",
  "type": "object",
  "properties": {
    "uuid": {
      "type": "string"
    },
    "handle": {
      "type": "integer"
    },
    "description": {
      "type": "string"
    },
    "properties": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "descriptors": {
      "default": [],
      "type": "array",
      "items": {
        "$ref": "#/definitions/BLEDescriptorMessage"
      }
    },
    "streamId": {
      "$ref": "#/definitions/StreamId"
    }
  },
  "required": [
    "uuid",
    "handle",
    "description",
    "properties"
  ],
  "additionalProperties": false,
  "definitions": {
    "BLECharacteristicReference": {
      "title": "BLECharacteristicReference",
      "description": "Nested reference to a parent characteristic.",
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string"
        },
        "handle": {
          "type": "integer"
        }
      },
      "required": [
        "uuid",
        "handle"
      ],
      "additionalProperties": false
    },
    "BLEDescriptorMessage": {
      "title": "BLEDescriptorMessage",
      "description": "A descriptor of a BLE characteristic.",
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string"
        },
        "handle": {
          "type": "integer"
        },
        "description": {
          "type": "string"
        },
        "characteristic": {
          "$ref": "#/definitions/BLECharacteristicReference"
        }
      },
      "required": [
        "uuid",
        "handle",
        "description",
        "characteristic"
      ],
      "additionalProperties": false
    },
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

## BLECharacteristicReference

``

Nested reference to a parent characteristic.

```json
{
  "title": "BLECharacteristicReference",
  "description": "Nested reference to a parent characteristic.",
  "type": "object",
  "properties": {
    "uuid": {
      "type": "string"
    },
    "handle": {
      "type": "integer"
    }
  },
  "required": [
    "uuid",
    "handle"
  ],
  "additionalProperties": false
}
```

## BLEDescriptorMessage

``

A descriptor of a BLE characteristic.

```json
{
  "title": "BLEDescriptorMessage",
  "description": "A descriptor of a BLE characteristic.",
  "type": "object",
  "properties": {
    "uuid": {
      "type": "string"
    },
    "handle": {
      "type": "integer"
    },
    "description": {
      "type": "string"
    },
    "characteristic": {
      "$ref": "#/definitions/BLECharacteristicReference"
    }
  },
  "required": [
    "uuid",
    "handle",
    "description",
    "characteristic"
  ],
  "additionalProperties": false,
  "definitions": {
    "BLECharacteristicReference": {
      "title": "BLECharacteristicReference",
      "description": "Nested reference to a parent characteristic.",
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string"
        },
        "handle": {
          "type": "integer"
        }
      },
      "required": [
        "uuid",
        "handle"
      ],
      "additionalProperties": false
    }
  }
}
```

## BLEServiceMessage

``

The BLE service's characteristics.

```json
{
  "title": "BLEServiceMessage",
  "description": "The BLE service's characteristics.",
  "type": "object",
  "properties": {
    "uuid": {
      "type": "string"
    },
    "handle": {
      "type": "integer"
    },
    "description": {
      "type": "string"
    },
    "characteristics": {
      "default": [],
      "type": "array",
      "items": {
        "$ref": "#/definitions/BLECharacteristicMessage"
      }
    }
  },
  "required": [
    "uuid",
    "handle",
    "description"
  ],
  "additionalProperties": false,
  "definitions": {
    "BLECharacteristicReference": {
      "title": "BLECharacteristicReference",
      "description": "Nested reference to a parent characteristic.",
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string"
        },
        "handle": {
          "type": "integer"
        }
      },
      "required": [
        "uuid",
        "handle"
      ],
      "additionalProperties": false
    },
    "BLEDescriptorMessage": {
      "title": "BLEDescriptorMessage",
      "description": "A descriptor of a BLE characteristic.",
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string"
        },
        "handle": {
          "type": "integer"
        },
        "description": {
          "type": "string"
        },
        "characteristic": {
          "$ref": "#/definitions/BLECharacteristicReference"
        }
      },
      "required": [
        "uuid",
        "handle",
        "description",
        "characteristic"
      ],
      "additionalProperties": false
    },
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
    },
    "BLECharacteristicMessage": {
      "title": "BLECharacteristicMessage",
      "description": "The BLE characteristic's properties.",
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string"
        },
        "handle": {
          "type": "integer"
        },
        "description": {
          "type": "string"
        },
        "properties": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "descriptors": {
          "default": [],
          "type": "array",
          "items": {
            "$ref": "#/definitions/BLEDescriptorMessage"
          }
        },
        "streamId": {
          "$ref": "#/definitions/StreamId"
        }
      },
      "required": [
        "uuid",
        "handle",
        "description",
        "properties"
      ],
      "additionalProperties": false
    }
  }
}
```

