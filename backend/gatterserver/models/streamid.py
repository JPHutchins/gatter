"""The unique 16-bit ID `| uint8 deviceId | uint8 channelId |`. """

from pydantic import validator

from gatterserver.models.gatterbasemodel import GatterBaseModel


class StreamId(GatterBaseModel):
    """The unique 16-bit ID `| uint8 deviceId | uint8 channelId |`."""

    deviceId: int
    channelId: int

    @validator("deviceId", "channelId")
    def must_be_uint8_t(cls, v):
        if v < 0 or v > 0xFF:
            raise ValueError("IDs must be uint8_t, 0-255")
        return v

    def __hash__(self):
        return (self.__dict__["deviceId"] << 8) | self.__dict__["channelId"]
