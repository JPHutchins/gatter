"""Define the application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from gatterserver.ble.discovery import BLEDiscoveryManager
from gatterserver.emitters.emittermanager import EmitterManager
from gatterserver.routers import ble, jsonposts, tests, websockets

discovery_manager = BLEDiscoveryManager()
emitter_manager = EmitterManager()

ble.register(discovery_manager)
websockets.register(emitter_manager)
jsonposts.register(emitter_manager)

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
