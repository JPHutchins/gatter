from fastapi.testclient import TestClient

from gatterserver.api import app

client = TestClient(app)


def test_hello_world():
    response = client.get("/tests/hello_world")
    assert response.status_code == 200
    assert response.json() == {"msg": "Hello world!"}


def test_reads_bytes():
    response = client.get("/tests/reads_bytes")
    assert response.status_code == 200
    assert response.content == b"\x00\x01\x02\x03"


def test_websocket_json():
    with client.websocket_connect("/tests/ws/hello") as websocket:
        data = websocket.receive_json()
        assert data == {"msg": "Hello WebSocket!"}


def test_websocket_bytes():
    with client.websocket_connect("/tests/ws/bytes") as websocket:
        data = websocket.receive_bytes()
        assert data == b"\x13\x37"
