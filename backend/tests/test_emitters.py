"""Test emitters."""

import asyncio

import pytest

from gatterserver.emitters.emitter import Emitter
from gatterserver.emitters.emittermanager import EmitterManager
from gatterserver.emitters.signalgen import Ramp
from gatterserver.streams import StreamId, StreamPacket


def test_emitter_base_class():
    e = Emitter(0)
    assert e
    assert e.device_id == 0


@pytest.mark.asyncio
async def test_emitter_manager_device_registration():
    em = EmitterManager()
    assert em
    assert len(em._emitters) == 0
    assert len(em._available_device_id_stack) == 255

    d = await em.register_device(Emitter)
    assert d == 0
    assert await em.is_registered(d)
    assert type(em._emitters[d]) == Emitter
    assert em._emitters[d].streams == []  # base class has no streams
    assert len(em._emitters) == 1
    assert len(em._available_device_id_stack) == 254

    for i in range(1, 20):
        d = await em.register_device(Emitter)
        assert d == i
        assert await em.is_registered(i)
        assert len(em._emitters) == i + 1
        assert len(em._available_device_id_stack) == 254 - i

    await em.unregister(15)
    assert not await em.is_registered(15)
    await em.unregister(3)
    assert not await em.is_registered(3)
    await em.unregister(12)
    assert not await em.is_registered(12)

    assert len(em._emitters) == 17

    assert await em.register_device(Emitter) == 12
    assert await em.register_device(Emitter) == 3
    assert await em.register_device(Emitter) == 15
    assert await em.register_device(Emitter) == 20


@pytest.mark.asyncio
async def test_emitter_manager_starts_stops_stream():
    em = EmitterManager()
    assert em

    # Register and configure a ramp
    d = await em.register_device(Ramp)
    assert d == 0
    assert type(em._emitters[d]) == Ramp
    assert len(em._emitters[d].streams) == 1

    r: Ramp = em._emitters[d]

    s = em._emitters[d].get_stream(0)
    assert s.task_handle == None
    assert s.send == None
    assert s.start != None

    TOP_OF_RAMP = 10
    r.configure(0, TOP_OF_RAMP, 1, 0.001)
    assert r.device_id == 0
    assert r._max == 10
    assert r._step_interval_s == 0.001
    assert r._step == 1
    assert r._min == 0

    # Start a stream via the EmitterManager
    r_stream_id = StreamId(device_id=0, channel_id=0)
    sm = em.stream_manager

    await em.start_stream(r_stream_id)

    assert type(s.task_handle) == asyncio.Task
    assert s.send != None

    async def test_ramp():
        i = -1
        a = 0
        periods = 0
        while periods < 2:
            i: StreamPacket = await sm.receive().__anext__()
            i = int.from_bytes(i.byte_array[4:], "little")
            assert i == a
            a += 1
            if i == TOP_OF_RAMP:
                periods += 1
                a = 0

    await test_ramp()

    await em.stop_stream(r_stream_id)

    assert s.task_handle == None
    assert s.send != None  # Since a stream was started once, the send cb is valid
    assert s.start != None

    # Test resuming stopped stream
    r._val = r._min  # ramp would otherwise resume where it left off
    await em.start_stream(r_stream_id)
    await test_ramp()
    await em.stop_stream(r_stream_id)
    assert s.task_handle == None
    assert s.send != None
    assert s.start != None
