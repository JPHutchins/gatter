"""Define routes that are only for tests."""

from fastapi import APIRouter, Response

router = APIRouter()


@router.get("/tests/hello_world", tags=["tests", "hello_world"])
async def hello_world() -> dict:
    return {"msg": "Hello world!"}


@router.get("/tests/reads_bytes", tags=["tests", "bytes"])
async def read_bytes() -> Response:
    return Response(content=b"\x00\x01\x02\x03")
