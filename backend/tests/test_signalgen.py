"""Test signal generators."""

import asyncio

import pytest

from gatterserver import models
from gatterserver.emitters.emittermanager import EmitterManager
from gatterserver.emitters.signalgen import Ramp
from gatterserver.streams import StreamManager, StreamPacket


def test_ramp_constructor():
    em = EmitterManager()

    r = Ramp(0, em)
    assert r
    assert r.device_id == 0


def test_ramp_configure():
    em = EmitterManager()

    r = Ramp(0, em)
    r.configure(0, 10, 1, 1)
    assert r.device_id == 0
    assert r._max == 10
    assert r._step_interval_s == 1
    assert r._step == 1
    assert r._min == 0


@pytest.mark.asyncio
async def test_ramp_integer_output():
    em = EmitterManager()

    s = models.StreamId(deviceId=0, channelId=0)
    sm = StreamManager()
    f = await sm.add_stream(s)

    TOP_OF_RAMP = 10
    r = Ramp(0, em)
    r.configure(0, TOP_OF_RAMP, 1, 0.001)
    stop = await r.start_stream(f)

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

    await stop()
