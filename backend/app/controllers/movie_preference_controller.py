"""Controllers for user movie preferences."""

from app.schemas.movie_preference import (
    MoviePreferenceListResponse,
    MoviePreferenceResponse,
    MoviePreferenceUpsertRequest,
)
from app.services.movie_preference_service import movie_preference_service


async def list_for_user(user_id: str) -> MoviePreferenceListResponse:
    return MoviePreferenceListResponse(
        results=await movie_preference_service.list_for_user(user_id)
    )


async def get(user_id: str, movie_id: int) -> MoviePreferenceResponse:
    return await movie_preference_service.get(user_id, movie_id)


async def upsert(
    user_id: str, movie_id: int, data: MoviePreferenceUpsertRequest
) -> MoviePreferenceResponse:
    return await movie_preference_service.upsert(user_id, movie_id, data)
