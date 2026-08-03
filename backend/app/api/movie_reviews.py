"""Endpoints for user-authored movie reviews."""

from typing import Annotated

from fastapi import APIRouter, Path, Request, Response

from app.schemas.movie_review import (
    MovieReviewListResponse,
    MovieReviewResponse,
    MovieReviewUpsertRequest,
)
from app.controllers import movie_review_controller
from app.middleware.jwt_auth import require_same_user
from app.middleware.rate_limiter import (
    movie_detail_limit,
    user_data_limit,
    write_limit,
)

router = APIRouter(tags=["movie reviews"])


@router.get("/movies/{movie_id}/reviews", response_model=MovieReviewListResponse)
@movie_detail_limit
async def list_movie_reviews(
    request: Request,
    response: Response,
    movie_id: Annotated[int, Path(ge=1)],
) -> MovieReviewListResponse:
    return await movie_review_controller.list_for_movie(movie_id)


@router.get("/users/{user_id}/reviews", response_model=MovieReviewListResponse)
@user_data_limit
async def list_user_reviews(
    request: Request,
    response: Response,
    user_id: Annotated[str, Path(min_length=1)],
) -> MovieReviewListResponse:
    return await movie_review_controller.list_for_user(user_id)


@router.get(
    "/users/{user_id}/reviews/{movie_id}",
    response_model=MovieReviewResponse,
)
@user_data_limit
async def get_user_movie_review(
    request: Request,
    response: Response,
    user_id: Annotated[str, Path(min_length=1)],
    movie_id: Annotated[int, Path(ge=1)],
) -> MovieReviewResponse:
    return await movie_review_controller.get(user_id, movie_id)


@router.put(
    "/users/{user_id}/reviews/{movie_id}",
    response_model=MovieReviewResponse,
)
@write_limit
async def upsert_user_movie_review(
    request: Request,
    response: Response,
    user_id: Annotated[str, Path(min_length=1)],
    movie_id: Annotated[int, Path(ge=1)],
    data: MovieReviewUpsertRequest,
) -> MovieReviewResponse:
    require_same_user(user_id, request)
    return await movie_review_controller.upsert(user_id, movie_id, data)
