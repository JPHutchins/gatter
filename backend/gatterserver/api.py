"""Define the application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from gatterserver.emitters.emittermanager import EmitterManager
from gatterserver.routers import jsonposts, tests, websockets

emitter_manger = EmitterManager()

websockets.register(emitter_manger)
jsonposts.register(emitter_manger)

app = FastAPI()

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
