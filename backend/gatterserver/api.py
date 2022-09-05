"""Define the application entry point."""

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from gatterserver.ble.discovery import BLEDiscoveryManager
from gatterserver.emitters.emittermanager import EmitterManager
from gatterserver.loggers import AsyncStreamHandler
from gatterserver.routers import ble, jsonposts, tests, websockets

# define and register global objects

discovery_manager = BLEDiscoveryManager()
emitter_manager = EmitterManager()
gui_handler = AsyncStreamHandler()

ble.register(discovery_manager)
websockets.register(emitter_manager, gui_handler)
jsonposts.register(emitter_manager, gui_handler)

app = FastAPI()

app.include_router(ble.router)
app.include_router(tests.router)
app.include_router(websockets.router)
app.include_router(jsonposts.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
