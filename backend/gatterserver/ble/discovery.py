"""Scan for BLE devices."""

import asyncio
import logging
from typing import Callable, Dict

from bleak import BleakScanner
from bleak.backends.device import BLEDevice
from bleak.backends.scanner import AdvertisementData

LOGGER = logging.getLogger(__name__)


class BLEDiscoveryManager:
    """Manage BLE Discovery."""

    def __init__(self):
        self._discovered: Dict[str, BLEDevice] = {}
        self._last_discovery: BLEDevice = None
        self._event = asyncio.Event()
        self._scanner = BleakScanner(detection_callback=self._make_on_discovery())
        self._task_handle: asyncio.Task = None

    def _make_on_discovery(self) -> Callable[[BLEDevice, AdvertisementData], None]:
        """Return the on_discovery callback."""

        def _on_discovery(device: BLEDevice, advertisement: AdvertisementData):
            """Callback on each BLE discovery."""
            self._discovered[device.address] = device
            self._last_discovery = device
            self._event.set()

        return _on_discovery

    async def start_discovery(self):
        """Start BLE discovery task."""
        if self._task_handle != None:
            LOGGER.warning("Discovery already running.")
            return
        self._task_handle = asyncio.create_task(self._scanner.start())

    async def stop_discovery(self):
        """Stop BLE discovery task."""
        if self._task_handle == None:
            LOGGER.warning("Discovery not running.")
            return
        await self._scanner.stop()
        self._task_handle.cancel()
        self._task_handle = None

    async def receive(self) -> BLEDevice:
        while True:
            await self._event.wait()
            self._event.clear()
            yield self._last_discovery
