"""Run the application."""

import logging

import uvicorn  # type: ignore

LOGGER = logging.getLogger(__name__)


LOGGER.info("Starting uvicorn application")
uvicorn.run("gatterserver.api:app", host="127.0.0.1", port=8000, reload=False)
