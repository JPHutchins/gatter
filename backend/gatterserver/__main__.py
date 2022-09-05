"""Run the application."""

import asyncio
import atexit
import logging
import os
import shutil
import sys
from datetime import datetime

import uvicorn  # type: ignore
from coloredlogs import ColoredFormatter  # type: ignore

from gatterserver.api import app
from gatterserver.loggers import LOG_FORMAT_STRING

LOG_PATH = "logs"
LOG_FILE = os.path.join(LOG_PATH, "current.log")
PREVIOUS_LOG_FILE = os.path.join(LOG_PATH, "previous.log")

if not os.path.exists(LOG_PATH):
    os.mkdir(LOG_PATH)

if os.path.exists(LOG_FILE):
    # this is an error condition - the log file should have already been moved at program exit
    shutil.copy(LOG_FILE, PREVIOUS_LOG_FILE)


def on_exit():
    file_handler.close()
    shutil.move(LOG_FILE, f"logs/{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.log")


atexit.register(on_exit)

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.DEBUG)

formatter = logging.Formatter(LOG_FORMAT_STRING)
color_formatter = ColoredFormatter(LOG_FORMAT_STRING)

console_handler = logging.StreamHandler(stream=sys.stdout)
console_handler.setLevel(logging.DEBUG)
console_handler.setFormatter(color_formatter)

file_handler = logging.FileHandler("logs/current.log", mode="w+", encoding="utf-8")
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)

LOGGER.addHandler(console_handler)
LOGGER.addHandler(file_handler)

LOGGER.critical("Program start.")

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
    finally:
        LOGGER.info("Shutting down the uvicorn server.")
        server.force_exit = True
        await server.shutdown()


try:
    _LOOP.run_until_complete(main())
except EOFError:
    LOGGER.info("Server exited without receiving message from Node.")
except Exception:
    LOGGER.exception("Unhandled exception.")
finally:
    LOGGER.critical("Program exit.")
