"""Validation and response contracts for user-authored movie reviews."""

from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.schemas.movie import MovieSummaryResponse


class MovieReviewUpsertRequest(BaseModel):
    rating: float = Field(ge=1, le=10)
    review: str = Field(min_length=1, max_length=5_000)

    @field_validator("review")
    @classmethod
    def review_must_contain_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Review must contain text")
        return normalized


class ReviewAuthorResponse(BaseModel):
    id: str
    username: str
    display_name: str
    profile_picture: str | None = None


class MovieReviewResponse(BaseModel):
    id: str
    user_id: str
    movie_id: int
    rating: float
    review: str
    movie: MovieSummaryResponse
    author: ReviewAuthorResponse
    created_at: datetime
    updated_at: datetime


class MovieReviewListResponse(BaseModel):
    results: list[MovieReviewResponse]
