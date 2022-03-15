"""Start a stream."""

from gatterserver.models.gatterbasemodel import GatterBaseModel
from gatterserver.models.streamid import StreamId


class StartStreamCommand(GatterBaseModel):
    """Start a stream."""

    streamId: StreamId
