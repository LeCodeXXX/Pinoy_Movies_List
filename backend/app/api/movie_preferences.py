"""Endpoints for a user's saved movie preferences."""

from typing import Annotated

from fastapi import APIRouter, Path, Request, Response

from app.schemas.movie_preference import (
    MoviePreferenceListResponse,
    MoviePreferenceResponse,
    MoviePreferenceUpsertRequest,
)
from app.controllers import movie_preference_controller
from app.middleware.jwt_auth import require_same_user
from app.middleware.rate_limiter import user_data_limit, write_limit

router = APIRouter(prefix="/users/{user_id}/movie-preferences", tags=["movie preferences"])


@router.get("", response_model=MoviePreferenceListResponse)
@user_data_limit
async def list_movie_preferences(
    request: Request,
    response: Response,
    user_id: Annotated[str, Path(min_length=1)],
) -> MoviePreferenceListResponse:
    require_same_user(user_id, request)
    return await movie_preference_controller.list_for_user(user_id)


@router.get("/{movie_id}", response_model=MoviePreferenceResponse)
@user_data_limit
async def get_movie_preference(
    request: Request,
    response: Response,
    user_id: Annotated[str, Path(min_length=1)],
    movie_id: Annotated[int, Path(ge=1)],
) -> MoviePreferenceResponse:
    require_same_user(user_id, request)
    return await movie_preference_controller.get(user_id, movie_id)


@router.put("/{movie_id}", response_model=MoviePreferenceResponse)
@write_limit
async def upsert_movie_preference(
    request: Request,
    response: Response,
    user_id: Annotated[str, Path(min_length=1)],
    movie_id: Annotated[int, Path(ge=1)],
    data: MoviePreferenceUpsertRequest,
) -> MoviePreferenceResponse:
    require_same_user(user_id, request)
    return await movie_preference_controller.upsert(user_id, movie_id, data)
