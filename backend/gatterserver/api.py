"""Define the application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from gatterserver.routers import tests

app = FastAPI()

app.include_router(tests.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
