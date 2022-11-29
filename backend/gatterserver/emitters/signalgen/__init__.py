"""Define gatter signal generators."""

import asyncio
import logging
from abc import abstractmethod
from typing import Awaitable, Callable, Optional, Union, cast

from gatterserver import models
from gatterserver.emitters.emitter import Emitter, Stream
from gatterserver.emitters.emittermanager import EmitterManager

LOGGER = logging.getLogger(__name__)


class SignalGenerator(Emitter):
    def __init__(self, device_id: int, emitter_manager: EmitterManager):
        super().__init__(device_id, emitter_manager)
        self._stop = False

    @abstractmethod
    async def start_stream(self, send: Callable[[bytes], None]):
        raise NotImplementedError

    def stop_stream(self):
        self._stop = True


class Ramp(SignalGenerator):
    def __init__(self, device_id: int, emitter_manager: EmitterManager):
        super().__init__(device_id, emitter_manager)

        self._max: Union[float, int, None] = None
        self._step_interval_s: Optional[float] = None
        self._step: Union[float, int, None] = None
        self._min: Union[float, int, None] = None
        self._val: Union[float, int, None] = None

        self.configure(0, 10, 1, 0.1)

        self._stream_id = models.StreamId(deviceId=device_id, channelId=0)
        print(self._stream_id)
        self._streams[self._stream_id] = Stream(start=self.start_stream)

    def configure(
        self,
        min: Union[float, int],
        max: Union[float, int],
        step: Union[float, int],
        step_interval_s: float,
    ):
        self._min = min
        self._max = max
        self._step = step
        self._step_interval_s = step_interval_s
        if self._val is None:
            self._val = min

    async def start_stream(self, send: Callable[[bytes], None]) -> Callable[[], Awaitable]:
        async def _task(send: Callable[[bytes], None]):
            try:
                while True:
                    if self._val > self._max:  # type: ignore
                        self._val = self._min
                    if self._stop:  # TODO: think about timing and sync
                        self._stop = False
                        break
                    self._val = cast(int, self._val)
                    send(int.to_bytes(self._val, 4, "little", signed=True))
                    self._step_interval_s = cast(float, self._step_interval_s)
                    await asyncio.sleep(self._step_interval_s)
                    self._step = cast(float, self._step)
                    self._val += self._step
            except asyncio.exceptions.CancelledError:
                LOGGER.debug("Task canceled.")

        self._streams[self._stream_id].task_handle = asyncio.create_task(
            _task(send), name=f"device_id: {self._device_id}, stream_id: 0"
        )

        async def stop():
            self._streams[self._stream_id].task_handle.cancel()
            await self._streams[self._stream_id].task_handle

        return stop
