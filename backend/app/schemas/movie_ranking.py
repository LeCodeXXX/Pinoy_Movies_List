from pydantic import BaseModel, Field

from app.schemas.movie import MovieSummaryResponse


class MovieRankingResponse(BaseModel):
    popular: list[MovieSummaryResponse] = Field(default_factory=list)
    rated: list[MovieSummaryResponse] = Field(default_factory=list)
    voted: list[MovieSummaryResponse] = Field(default_factory=list)
