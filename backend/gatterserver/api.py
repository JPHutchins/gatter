"""Define the application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from gatterserver.routers import tests, websockets
from gatterserver.streams import StreamManager

stream_manager = StreamManager()

websockets.register(stream_manager)

app = FastAPI()

app.include_router(tests.router)
app.include_router(websockets.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
