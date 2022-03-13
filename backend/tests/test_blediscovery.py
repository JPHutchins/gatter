"""Test BLE Discovery."""

import asyncio
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

from gatterserver.api import app
from gatterserver.ble.discovery import BLEDiscoveryManager

client = TestClient(app)


def test_ble_discovery_manager_constructor():
    bm = BLEDiscoveryManager()
    assert bm
    assert bm._discovered == {}
    assert bm._last_discovery == None
    assert type(bm._event) == asyncio.Event
    assert bm._event.is_set() == False
    assert bm._scanner != None
    assert bm._task_handle == None


@pytest.mark.asyncio
async def test_ble_discovery_manager_starts_scanning():
    bm = BLEDiscoveryManager()
    bm._scanner.start = AsyncMock()

    await bm.start_discovery()
    bm._scanner.start.assert_called_once()
    assert type(bm._task_handle) == asyncio.Task
    assert bm._event.is_set() == False


@pytest.mark.asyncio
async def test_ble_discovery_manager_stops_scanning():
    bm = BLEDiscoveryManager()
    bm._scanner.start = AsyncMock()
    bm._scanner.stop = AsyncMock()

    await bm.start_discovery()
    bm._scanner.start.assert_called_once()
    assert type(bm._task_handle) == asyncio.Task
    assert bm._event.is_set() == False

    await bm.stop_discovery()
    bm._scanner.stop.assert_called_once()
    assert bm._task_handle == None
    assert bm._event.is_set() == False
