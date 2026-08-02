"""Controllers for user movie reviews."""

from app.schemas.movie_review import (
    MovieReviewListResponse,
    MovieReviewResponse,
    MovieReviewUpsertRequest,
)
from app.services.movie_review_service import movie_review_service


async def list_for_movie(movie_id: int) -> MovieReviewListResponse:
    return MovieReviewListResponse(
        results=await movie_review_service.list_for_movie(movie_id)
    )


async def list_for_user(user_id: str) -> MovieReviewListResponse:
    return MovieReviewListResponse(
        results=await movie_review_service.list_for_user(user_id)
    )


async def get(user_id: str, movie_id: int) -> MovieReviewResponse:
    return await movie_review_service.get(user_id, movie_id)


async def upsert(
    user_id: str, movie_id: int, data: MovieReviewUpsertRequest
) -> MovieReviewResponse:
    return await movie_review_service.upsert(user_id, movie_id, data)
