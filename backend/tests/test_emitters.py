"""Test emitters."""

import pytest

from gatterserver.emitters.emitter import Emitter
from gatterserver.emitters.emittermanager import EmitterManager


def test_emitter_base_class():
    e = Emitter(0)
    assert e
    assert e.device_id == 0


@pytest.mark.asyncio
async def test_emitter_manager():
    em = EmitterManager()
    assert em
    assert len(em._emitters) == 0
    assert len(em._available_device_id_stack) == 255

    d = await em.register()
    assert d == 0
    assert await em.is_registered(0)
    assert len(em._emitters) == 1
    assert len(em._available_device_id_stack) == 254

    for i in range(1, 20):
        d = await em.register()
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

    assert await em.register() == 12
    assert await em.register() == 3
    assert await em.register() == 15
    assert await em.register() == 20
