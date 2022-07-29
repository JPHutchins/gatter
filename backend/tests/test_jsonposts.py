"""Test JSON POSTs."""

import asyncio
import json

import pytest
from fastapi.testclient import TestClient

from gatterserver import models
from gatterserver.api import app

client = TestClient(app)


def test_add_and_delete():
    command = {"emitterType": models.RAMP_EMITTER_TYPE}
    response = client.post(models.API_CMD_ADD_PATH, data=json.dumps(command))
    assert response.status_code == 200
    assert response.json() == {
        "address": None,
        "emitterType": models.RAMP_EMITTER_TYPE,
        "deviceId": 0,
    }
    response = client.post(models.API_CMD_ADD_PATH, data=json.dumps(command))
    assert response.status_code == 200
    response = client.post(models.API_CMD_ADD_PATH, data=json.dumps(command))
    assert response.status_code == 200
    response = client.post(models.API_CMD_ADD_PATH, data=json.dumps(command))
    assert response.status_code == 200
    response = client.post(models.API_CMD_ADD_PATH, data=json.dumps(command))
    assert response.status_code == 200
    assert response.json() == {
        "address": None,
        "emitterType": models.RAMP_EMITTER_TYPE,
        "deviceId": 4,
    }

    command = {"deviceId": 2}
    response = client.post(models.API_CMD_DEL_PATH, data=json.dumps(command))
    assert response.status_code == 200
    assert response.json() == {"channelId": None, "deviceId": 2}

    # Assert that deviceId 2 was returned to available device stack
    command = {"emitterType": models.RAMP_EMITTER_TYPE}
    response = client.post(models.API_CMD_ADD_PATH, data=json.dumps(command))
    assert response.status_code == 200
    assert response.json() == {
        "address": None,
        "emitterType": models.RAMP_EMITTER_TYPE,
        "deviceId": 2,
    }


@pytest.mark.asyncio
async def test_start_stream():
    command = {"deviceId": 0}
    response = client.post(models.API_CMD_DEL_PATH, data=json.dumps(command))
    assert response.status_code == 200

    command = {"streamId": {"deviceId": 0, "channelId": 0}}
    response = client.post(models.API_CMD_START_STREAM_PATH, data=json.dumps(command))
    assert response.status_code == 400
    assert response.json() == {"error": "Could not get deviceId=0 channelId=0"}

    command = {"emitterType": models.RAMP_EMITTER_TYPE}
    response = client.post(models.API_CMD_ADD_PATH, data=json.dumps(command))
    assert response.status_code == 200
    assert response.json() == {
        "address": None,
        "emitterType": models.RAMP_EMITTER_TYPE,
        "deviceId": 0,
    }

    async def frontend_websocket_endpoint_task():
        with client.websocket_connect("/api/ws/streams") as websocket:
            i = 0
            while True and i != 9:
                await asyncio.sleep(0.001)
                data = websocket.receive_bytes()
                print(data, bytes([0, 0, 4, 0, i, 0, 0, 0]))
                assert data == bytes([0, 0, 4, 0, i, 0, 0, 0])
                i += 1

    t = asyncio.create_task(frontend_websocket_endpoint_task())

    command = {"streamId": {"deviceId": 0, "channelId": 0}}

    response = client.post(models.API_CMD_START_STREAM_PATH, data=json.dumps(command))
    assert response.status_code == 200
    assert response.json() == command

    t.cancel()


@pytest.mark.asyncio
async def test_add_ble():
    # Should fail if address is not provided
    command = {"emitterType": models.BLE_EMITTER_TYPE}
    response = client.post(models.API_CMD_ADD_PATH, data=json.dumps(command))
    assert response.status_code == 422

    command = {"emitterType": models.BLE_EMITTER_TYPE, "address": "aa:bb:..."}
    response = client.post(models.API_CMD_ADD_PATH, data=json.dumps(command))
    assert response.status_code == 200

    assert response.json() == {
        "address": "aa:bb:...",
        "emitterType": models.BLE_EMITTER_TYPE,
        "deviceId": 5,
    }


@pytest.mark.asyncio
async def test_connect_to_ble():
    command = {"deviceId": 999}
    response = client.post("/api/ble/connect", data=json.dumps(command))
    assert response.status_code == 400
    assert response.content == b'{"error":"Could not get device 999"}'

    command = {"deviceId": 0}
    response = client.post("/api/ble/connect", data=json.dumps(command))
    assert response.status_code == 400
    assert response.content == b'{"error":"Device 0 is not a BLE device"}'

    # TODO: mock and patch


@pytest.mark.asyncio
async def test_read_characteristic():
    command = {"deviceId": 999, "handle": 2}
    response = client.post("/api/ble/read/characteristic", data=json.dumps(command))
    assert response.status_code == 400
    assert response.content == b'{"error":"Could not get device 999"}'

    command = {"deviceId": 0, "handle": 3}
    response = client.post("/api/ble/read/characteristic", data=json.dumps(command))
    assert response.status_code == 400
    assert response.content == b'{"error":"Device 0 is not a BLE device"}'

    # TODO: mock and patch
