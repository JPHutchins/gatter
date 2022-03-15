"""The default base class for Gatter Pyadantic models."""

from typing import Any, Dict

from pydantic import BaseModel, Extra


class GatterBaseModel(BaseModel):
    """The default base class for Gatter Pyadantic models."""

    class Config:
        """The default config for Gatter Pyadantic models."""

        extra = Extra.forbid

        @staticmethod
        def schema_extra(schema: Dict[str, Any], model: BaseModel) -> None:
            for prop in schema.get("properties", {}).values():
                prop.pop("title", None)
