"""Test the BLE Emitter class."""

import inspect
from typing import Tuple
from unittest import mock
from unittest.mock import AsyncMock, MagicMock, PropertyMock, patch

import pytest
from black import Iterator
from bleak import BleakClient

from gatterserver import models
from gatterserver.emitters.ble_emitter import BLEEmitter
from gatterserver.emitters.emittermanager import EmitterManager
from gatterserver.models.streamid import StreamId
from gatterserver.streams import Stream


class MockBleakGATTDescriptor:
    def __init__(self, uuid="uuid", handle=42, description="description"):
        self.uuid = uuid
        self.handle = handle
        self.description = description
        self.characteristic_uuid = "characteristic_uuid"
        self.characteristic_handle = 42


class MockBleakGATTCharacteristic:
    def __init__(self, properties, descriptors=(), handle=0):
        self.service_uuid = ""
        self.service_handle = 0
        self.handle = handle
        self.uuid = ""
        self.description = ""
        self.properties = properties
        self.descriptors = descriptors
        self.get_descriptor = MagicMock()
        self.add_descriptor = MagicMock()


class MockBleakGATTService:
    def __init__(self, *args):
        self.characteristics = args
        self.uuid = "uuid"
        self.handle = 42
        self.description = "description"


@pytest.fixture
def ble_emitter() -> Iterator[Tuple[BLEEmitter, EmitterManager]]:
    em = EmitterManager()
    yield BLEEmitter(0, em, "the address string"), em


def test_constructor(ble_emitter: Tuple[BLEEmitter, EmitterManager]):
    e, em = ble_emitter

    assert e
    assert e.device_id == 0
    assert e.ble_device_message == models.BLEDeviceMessage(deviceId=0)
    assert e._em is em
    assert e.address == "the address string"
    assert bool(e.connected) is False
    assert type(e.bc) == BleakClient
    assert e._services == {}
    assert e._characteristics == {}
    assert e._streams == {}
    assert e._next_channel_id == 0

    # assert instance attributes of the BleakClient
    assert e.bc.address == "the address string"

    with pytest.raises(TypeError):
        e = BLEEmitter(0, "the address string")  # type: ignore

    with pytest.raises(TypeError):
        e = BLEEmitter(0, em, "the address string", "another arg")  # type: ignore


@pytest.mark.asyncio
async def test_connect_success(ble_emitter: Tuple[BLEEmitter, EmitterManager]):
    e, _ = ble_emitter

    # mock successful Bleak connect
    e._client.connect = AsyncMock(return_value=True)

    e._examine_gatt = AsyncMock()  # type: ignore

    assert e.connected is False

    await e.connect(0.1)
    e._client.connect.assert_awaited_once_with(timeout=0.1)
    e._examine_gatt.assert_awaited_once()

    with mock.patch("bleak.BleakClient.is_connected", new_callable=PropertyMock) as m:
        m.return_value = True
        assert e.connected is True

        # reconnect just inspects gatt again
        e._examine_gatt.reset_mock()
        e._client.connect.reset_mock()
        assert await e.connect(0.1) is True
        e._client.connect.assert_not_awaited()
        e._examine_gatt.assert_awaited_once()


@pytest.mark.asyncio
async def test_connect_fail(ble_emitter: Tuple[BLEEmitter, EmitterManager]):
    e, _ = ble_emitter

    await e.connect(0.1)
    assert e.connected is False

    # mock fail Bleak connect
    e._client.connect = AsyncMock(return_value=False)

    await e.connect(0.1)
    e._client.connect.assert_awaited_once_with(timeout=0.1)
    assert e.connected is False


@pytest.mark.asyncio
async def test_connect_handles_OSError(ble_emitter: Tuple[BLEEmitter, EmitterManager]):
    e, _ = ble_emitter

    # mock Bleak raises OSError
    e._client.connect = AsyncMock(return_value=False, side_effect=OSError)

    with patch("gatterserver.emitters.ble_emitter.BleakClient") as bc:
        instance = bc.return_value
        instance.connect = AsyncMock(return_value=False)
        await e.connect(0.1)
        bc.assert_called_once()
        instance.connect.assert_awaited_once()


@pytest.mark.asyncio
async def test_disconnect(ble_emitter: Tuple[BLEEmitter, EmitterManager]):
    e, _ = ble_emitter

    # mock successful Bleak connect
    e._client.connect = AsyncMock(return_value=True)

    assert e.connected is False

    await e.connect(0.1)

    # mock successful Bleak discconnect
    e._client.disconnect = AsyncMock(return_value=True)

    await e.disconnect()
    assert e.connected is False


@pytest.mark.asyncio
async def test_pair(ble_emitter: Tuple[BLEEmitter, EmitterManager]):
    e, _ = ble_emitter

    # mock
    e._client.pair = AsyncMock(return_value=True)
    await e.pair()
    e._client.pair.assert_awaited_once()


@pytest.mark.asyncio
async def test_unpair(ble_emitter: Tuple[BLEEmitter, EmitterManager]):
    e, _ = ble_emitter

    # mock
    e._client.unpair = AsyncMock(return_value=True)
    await e.unpair()
    e._client.unpair.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_services(ble_emitter: Tuple[BLEEmitter, EmitterManager]):
    e, _ = ble_emitter

    # mock
    e._client.get_services = AsyncMock()
    e._examine_gatt = AsyncMock()  # type: ignore
    await e.get_services()
    e._client.get_services.assert_awaited_once()
    e._examine_gatt.assert_awaited_once()


@pytest.mark.asyncio
async def test_read_characteristic(ble_emitter: Tuple[BLEEmitter, EmitterManager]):
    e, _ = ble_emitter

    # mock
    e._client.read_gatt_char = AsyncMock(return_value=bytearray([1, 2, 3, 4]))
    b = await e.read_characteristic(42)
    e._client.read_gatt_char.assert_awaited_once_with(42)
    assert b == bytes([1, 2, 3, 4])


@pytest.mark.asyncio
async def test_descriptor(ble_emitter: Tuple[BLEEmitter, EmitterManager]):
    e, _ = ble_emitter

    # mock
    e._client.read_gatt_descriptor = AsyncMock(return_value=bytearray([1, 2, 3, 4]))
    b = await e.read_descriptor(42)
    e._client.read_gatt_descriptor.assert_awaited_once_with(42)
    assert b == bytes([1, 2, 3, 4])


@pytest.mark.asyncio
async def test_write_characteristic(ble_emitter: Tuple[BLEEmitter, EmitterManager]):
    e, _ = ble_emitter

    d = bytes([1, 2, 3, 4])

    # mock
    e._client.write_gatt_char = AsyncMock(return_value=True)
    r = await e.write_characteristic(42, d)
    e._client.write_gatt_char.assert_awaited_once_with(42, d, False)
    assert r is True


@pytest.mark.asyncio
async def test_write_descriptor(ble_emitter: Tuple[BLEEmitter, EmitterManager]):
    e, _ = ble_emitter

    d = bytes([1, 2, 3, 4])

    # mock
    e._client.write_gatt_descriptor = AsyncMock(return_value=True)
    r = await e.write_descriptor(42, d)
    e._client.write_gatt_descriptor.assert_awaited_once_with(42, d)
    assert r is True


@pytest.mark.asyncio
async def test_maybe_register_stream(ble_emitter: Tuple[BLEEmitter, EmitterManager]):
    e, _ = ble_emitter

    c = MockBleakGATTCharacteristic("a")
    c.properties = ["read", "write"]

    await e._maybe_register_stream(c)
    assert e._streams == {}

    c.properties = ["notify"]
    id = await e._maybe_register_stream(c)
    assert id == StreamId(deviceId=0, channelId=0)
    assert len(e._streams) == 1
    s = e._streams[id]
    assert type(s) == Stream
    assert inspect.iscoroutinefunction(s.start)
    assert s.stop is None
    assert s.task_handle is None
    assert not inspect.iscoroutinefunction(s.send)

    c.properties = ["indicate"]
    id = await e._maybe_register_stream(c)
    assert id == StreamId(deviceId=0, channelId=1)
    assert len(e._streams) == 2
    assert type(e._streams[id]) == Stream


@pytest.mark.asyncio
async def test_start_notify(ble_emitter: Tuple[BLEEmitter, EmitterManager]):
    e, _ = ble_emitter

    e._client.start_notify = AsyncMock()

    c = MockBleakGATTCharacteristic("a")
    c.handle = 42

    c.properties = ["notify"]

    id = await e._maybe_register_stream(c)
    assert id is not None
    await e.start_notify(id)
    e._client.start_notify.assert_awaited()
    assert 42 in e._client.start_notify.call_args_list[0].args
    assert inspect.iscoroutinefunction(e._streams[id].stop)

    id = await e._maybe_register_stream(c)
    assert id is not None
    kwargs = {"keyword": "arguments"}
    await e.start_notify(id, **kwargs)
    e._client.start_notify.assert_awaited()
    assert 42 in e._client.start_notify.call_args_list[1].args
    assert kwargs == e._client.start_notify.call_args_list[1].kwargs

    with pytest.raises(KeyError):
        await e.start_notify(StreamId(deviceId=99, channelId=88))


@pytest.mark.asyncio
async def test_stop_notify(ble_emitter: Tuple[BLEEmitter, EmitterManager]):
    e, _ = ble_emitter

    e._client.start_notify = AsyncMock()
    e._client.stop_notify = AsyncMock()

    c = MockBleakGATTCharacteristic("a")
    c.handle = 42

    c.properties = ["notify"]

    id = await e._maybe_register_stream(c)
    assert id is not None
    await e.start_notify(id)

    await e.stop_notify(id)
    e._client.stop_notify.assert_awaited_once_with(42)


@pytest.mark.asyncio
async def test_examine_gatt(ble_emitter: Tuple[BLEEmitter, EmitterManager]):
    _, em = ble_emitter
    id = await em.register_device(BLEEmitter, address="address")

    e: BLEEmitter = em[id]  # type: ignore

    # create some fake discovery results
    e._client.services = (
        MockBleakGATTService(
            MockBleakGATTCharacteristic(("read",)),
            MockBleakGATTCharacteristic(("notify",), handle=88),
        ),
        MockBleakGATTService(
            MockBleakGATTCharacteristic(
                ("indicate",), (MockBleakGATTDescriptor("one", 2, "three"),), handle=7
            )
        ),
    )

    await e._examine_gatt()

    s1 = StreamId(deviceId=0, channelId=0)
    s2 = StreamId(deviceId=0, channelId=1)

    assert len(e.streams) == 2
    assert e.streams[s1]  # the "notify" above
    assert e.streams[s2]  # the "indicate" above

    # assert that start gets called with the handle
    e._client.start_notify = AsyncMock()

    await em.start_stream(s1)
    assert 88 in e._client.start_notify.call_args[0]

    await em.start_stream(s2)
    assert 7 in e._client.start_notify.call_args[0]

    # assert stop gets called with the handle
    e._client.stop_notify = AsyncMock()

    await em.stop_stream(s1)
    assert 88 in e._client.stop_notify.call_args[0]

    await em.stop_stream(s2)
    assert 7 in e._client.stop_notify.call_args[0]
