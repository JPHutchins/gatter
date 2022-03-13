"""Test streams."""

import asyncio

import pytest
from pydantic import ValidationError

from gatterserver.streams import Stream, StreamId, StreamManager, StreamPacket


def test_stream_type():
    with pytest.raises(ValidationError):
        s = Stream()

    with pytest.raises(ValidationError):
        s = Stream(start="hello fellow callback functions")

    s = Stream(start=lambda x: x)
    assert s
    assert s.start != None
    assert s.task_handle == None
    assert s.send == None


def test_stream_id_type():
    s = StreamId(device_id=4, channel_id=8)
    assert s
    assert s.device_id == 4
    assert s.channel_id == 8

    with pytest.raises(ValueError):
        s = StreamId(device_id=4)

    with pytest.raises(ValueError):
        s = StreamId(channel_id=4)

    with pytest.raises(ValueError):
        s = StreamId(device_id=-1)

    with pytest.raises(ValueError):
        s = StreamId(channel_id=256)

    with pytest.raises(ValueError):
        s = StreamId()

    s = StreamId(device_id=5, channel_id=12)
    assert s.__hash__() == 1292
    assert s.__hash__() == (5 << 8) | 12


def test_stream_packet_type():
    s = StreamId(device_id=4, channel_id=8)
    d = b"\x01\x02\x03\x04"
    p = StreamPacket(s, d)
    assert p
    assert p.stream_id.device_id == 4
    assert p._raw_data == b"\x01\x02\x03\x04"
    assert p._raw_data_length == 4
    assert p._byte_array == b"\x04\x08\x04\x00\x01\x02\x03\x04"
    assert p.byte_array == b"\x04\x08\x04\x00\x01\x02\x03\x04"

    d = bytearray([i for i in range(0xFF)])
    p = StreamPacket(s, d)
    assert p
    assert p._raw_data_length == 0xFF
    assert int.from_bytes(p.byte_array[2:4], "little") == 0xFF
    assert p.byte_array[4:] == bytearray([i for i in range(0xFF)])


def test_stream_manager_constructor():
    sm = StreamManager()
    assert sm
    assert sm._lock.locked() == False
    assert not sm._semaphore.locked() == False
    assert len(sm._pending_data) == 0
    assert len(sm._streams) == 0


@pytest.mark.asyncio
async def test_stream_manager_adds_streams():
    s0 = StreamId(device_id=0, channel_id=0)
    s1 = StreamId(device_id=1, channel_id=0)

    sm = StreamManager()

    f0 = await sm.add_stream(s0)
    f1 = await sm.add_stream(s1)
    assert s0 in sm._streams
    assert s1 in sm._streams
    assert f0 != f1


@pytest.mark.asyncio
async def test_stream_manager_removes_streams():
    s0 = StreamId(device_id=0, channel_id=0)
    s1 = StreamId(device_id=1, channel_id=0)

    sm = StreamManager()

    f0 = await sm.add_stream(s0)
    f1 = await sm.add_stream(s1)
    assert s0 in sm._streams
    assert s1 in sm._streams
    assert f0 != f1

    await sm.remove_stream(s0)
    assert s0 not in sm._streams
    assert s1 in sm._streams

    await sm.remove_stream(s1)
    assert s0 not in sm._streams
    assert s1 not in sm._streams

    # Shouldn't raise exception
    await sm.remove_stream(s0)
    await sm.remove_stream(s1)


@pytest.mark.asyncio
async def test_stream_manager_callbacks_set_flag_and_queue_packets():
    s0 = StreamId(device_id=0, channel_id=0)
    s1 = StreamId(device_id=1, channel_id=0)

    sm = StreamManager()

    f0 = await sm.add_stream(s0)
    f1 = await sm.add_stream(s1)

    assert sm._semaphore.locked()

    await f0(b"\x00")
    assert not sm._semaphore.locked()
    assert len(sm._pending_data) == 1
    assert sm._pending_data[0].byte_array == b"\x00\x00\x01\x00\x00"

    await f1(b"\x01")
    assert not sm._semaphore.locked()
    assert len(sm._pending_data) == 2
    assert sm._pending_data[0].byte_array == b"\x00\x00\x01\x00\x00"
    assert sm._pending_data[1].byte_array == b"\x01\x00\x01\x00\x01"


@pytest.mark.asyncio
async def test_stream_manager_receive_method():
    s0 = StreamId(device_id=0, channel_id=0)
    sm = StreamManager()
    f0 = await sm.add_stream(s0)
    assert sm._semaphore.locked()

    await f0(b"\x00")
    assert not sm._semaphore.locked()
    assert len(sm._pending_data) == 1
    assert sm._pending_data[0].byte_array == b"\x00\x00\x01\x00\x00"

    packet = await sm.receive().__anext__()
    assert packet.byte_array == b"\x00\x00\x01\x00\x00"
    assert len(sm._pending_data) == 0
    assert sm._semaphore.locked()


@pytest.mark.asyncio
async def test_stream_manager_receive_method_many():
    s0 = StreamId(device_id=0, channel_id=0)
    s1 = StreamId(device_id=1, channel_id=0)

    sm = StreamManager()

    f0 = await sm.add_stream(s0)
    f1 = await sm.add_stream(s1)

    assert sm._semaphore.locked()

    # Add 1000 events to the stream queue
    await asyncio.gather(
        *tuple(
            [f0(int.to_bytes(even, 2, "little")) for even in range(0, 1000, 2)]
            + [f1(int.to_bytes(odd, 2, "little")) for odd in range(1, 1000, 2)]
        )
    )

    assert not sm._semaphore.locked()
    assert len(sm._pending_data) == 1000

    s0_vals = []
    s1_vals = []
    for _ in range(len(sm._pending_data)):
        packet: StreamPacket = await sm.receive().__anext__()
        data = packet.byte_array
        size = int.from_bytes(data[2:4], "little")
        if data[0] == 0:
            s0_vals.append(int.from_bytes(data[4 : 4 + size], "little"))
        elif data[0] == 1:
            s1_vals.append(int.from_bytes(data[4 : 4 + size], "little"))
        else:
            assert 0

    assert s0_vals == [even for even in range(0, 1000, 2)]
    assert s1_vals == [odd for odd in range(1, 1000, 2)]

    assert sm._semaphore.locked()
    assert len(sm._pending_data) == 0
