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
