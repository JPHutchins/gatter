"""Run the application."""

import asyncio
import atexit
import logging
import os
import shutil
import sys
from datetime import datetime

import uvicorn  # type: ignore

from gatterserver.api import app

LOG_FILE = "logs/current.log"
PREVIOUS_LOG_FILE = "logs/previous.log"

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.DEBUG)

formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

console_handler = logging.StreamHandler(stream=sys.stdout)
console_handler.setLevel(logging.DEBUG)
console_handler.setFormatter(formatter)

file_handler = logging.FileHandler("logs/current.log", mode="w+", encoding="utf-8")
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)

LOGGER.addHandler(console_handler)
LOGGER.addHandler(file_handler)

LOGGER.critical("Program start.")

if os.path.exists(LOG_FILE):
    # this is an error condition - the log file should have already been moved at program exit
    LOGGER.error("Log file was not renamed after last program exit.")
    shutil.copy(LOG_FILE, PREVIOUS_LOG_FILE)


def on_exit():
    shutil.move(LOG_FILE, f"logs/{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.log")


atexit.register(on_exit)

config = uvicorn.Config(app, host="127.0.0.1", port=8000, log_level="info", loop="asyncio")
server = uvicorn.Server(config=config)

# remove the redundant logging, only use our handlers
logging.getLogger("uvicorn").removeHandler(logging.getLogger("uvicorn").handlers[0])


_LOOP = asyncio.new_event_loop()


async def wait_for_stdin(server_task: asyncio.Task):
    await _LOOP.run_in_executor(None, input)
    _LOOP.call_soon_threadsafe(server_task.cancel)


async def main():
    server_task = _LOOP.create_task(server.serve())
    wait_for_stdin_task = _LOOP.create_task(wait_for_stdin(server_task))

    try:
        await asyncio.gather(server_task, wait_for_stdin_task)
    except asyncio.CancelledError:
        LOGGER.info("Task canceled.")
        pass
    finally:
        LOGGER.info("Shutting down the uvicorn server.")
        server.force_exit = True
        await server.shutdown()


try:
    _LOOP.run_until_complete(main())
except Exception:
    LOGGER.exception("Unhandled exception.")
finally:
    LOGGER.critical("Program exit.")
