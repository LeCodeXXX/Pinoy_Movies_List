"""Endpoints for a user's saved movie preferences."""

from typing import Annotated

from fastapi import APIRouter, Path

from app.schemas.movie_preference import (
    MoviePreferenceListResponse,
    MoviePreferenceResponse,
    MoviePreferenceUpsertRequest,
)
from app.services.movie_preference_service import movie_preference_service

router = APIRouter(prefix="/users/{user_id}/movie-preferences", tags=["movie preferences"])


@router.get("", response_model=MoviePreferenceListResponse)
async def list_movie_preferences(
    user_id: Annotated[str, Path(min_length=1)],
) -> MoviePreferenceListResponse:
    return MoviePreferenceListResponse(
        results=await movie_preference_service.list_for_user(user_id)
    )


@router.get("/{movie_id}", response_model=MoviePreferenceResponse)
async def get_movie_preference(
    user_id: Annotated[str, Path(min_length=1)],
    movie_id: Annotated[int, Path(ge=1)],
) -> MoviePreferenceResponse:
    return await movie_preference_service.get(user_id, movie_id)


@router.put("/{movie_id}", response_model=MoviePreferenceResponse)
async def upsert_movie_preference(
    user_id: Annotated[str, Path(min_length=1)],
    movie_id: Annotated[int, Path(ge=1)],
    data: MoviePreferenceUpsertRequest,
) -> MoviePreferenceResponse:
    return await movie_preference_service.upsert(user_id, movie_id, data)
