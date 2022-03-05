"""Define gatter signal generators."""

import asyncio
import logging
from abc import abstractmethod
from typing import Awaitable

from gatterserver.emitters.emitter import Emitter

LOGGER = logging.getLogger(__name__)


class SignalGenerator(Emitter):
    def __init__(self, device_id: int):
        super().__init__(device_id)
        self._stop = False

    @abstractmethod
    async def start_stream(self, send: Awaitable):
        raise NotImplementedError

    def stop_stream(self):
        self._stop = True


class Ramp(SignalGenerator):
    def __init__(
        self,
        device_id: int,
        max: int,
        step_interval_s: float,
        step: int = 1,
        min: int = 0,
    ):
        super().__init__(device_id)
        self._max = max
        self._step_interval_s = step_interval_s
        self._step = step
        self._min = min
        self._val = min

    async def start_stream(self, send: Awaitable):
        while True:
            if self._val > self._max:
                self._val = self._min
            if self._stop:  # TODO: think about timing and sync
                self._stop = False
                break
            await asyncio.gather(
                send(int.to_bytes(self._val, 4, "little", signed=True)),
                asyncio.sleep(self._step_interval_s),
            )
            self._val += self._step
