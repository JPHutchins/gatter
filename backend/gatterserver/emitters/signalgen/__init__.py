"""Define gatter signal generators."""

import asyncio
import logging
from abc import abstractmethod
from typing import Awaitable, Union

from gatterserver.emitters.emitter import Emitter, Stream

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
    def __init__(self, device_id: int):
        super().__init__(device_id)

        self._max: Union[float, int] = None
        self._step_interval_s: float = None
        self._step: Union[float, int] = None
        self._min: Union[float, int] = None
        self._val: Union[float, int] = None

        self.configure(0, 10, 1, 0.001)

        self._streams = [Stream(start=self.start_stream)]

    def configure(
        self,
        min: Union[float, int],
        max: Union[float, int],
        step: Union[float, int],
        step_interval_s: float,
    ):
        self._min: Union[float, int] = min
        self._max: Union[float, int] = max
        self._step: Union[float, int] = step
        self._step_interval_s: float = step_interval_s
        if self._val == None:
            self._val = min

    def start_stream(self, send: Awaitable) -> asyncio.Task:
        async def _task(send: Awaitable):
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

        return asyncio.create_task(
            _task(send), name=f"device_id: {self._device_id}, stream_id: 0"
        )
