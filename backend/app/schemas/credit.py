from pydantic import BaseModel, Field

from app.schemas.movie import MovieSummaryResponse


class CreditProfileResponse(BaseModel):
    id: int
    name: str
    description: str = ""
    image_url: str | None = None
    kind: str
    role: str | None = None


class CreditMoviesResponse(BaseModel):
    profile: CreditProfileResponse
    page: int
    total_pages: int
    total_results: int
    results: list[MovieSummaryResponse] = Field(default_factory=list)
