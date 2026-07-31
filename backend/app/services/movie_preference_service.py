"""Business rules for saving and retrieving a user's movie list."""

from pymongo.errors import DuplicateKeyError

from app.core.exceptions import MoviePreferenceNotFoundError, UserNotFoundError
from app.models.user_movie_data import MoviePreference, MovieSnapshot
from app.repositories.movie_preference_repository import (
    MoviePreferenceRepository,
    movie_preference_repository,
)
from app.repositories.user_repository import UserRepository, user_repository
from app.schemas.movie import MovieSummaryResponse
from app.schemas.movie_preference import (
    MoviePreferenceResponse,
    MoviePreferenceUpsertRequest,
)
from app.services.movie_service import MovieService, movie_service


class MoviePreferenceService:
    def __init__(
        self,
        repository: MoviePreferenceRepository = movie_preference_repository,
        users: UserRepository = user_repository,
        movies: MovieService = movie_service,
    ) -> None:
        self.repository = repository
        self.users = users
        self.movies = movies

    async def list_for_user(self, user_id: str) -> list[MoviePreferenceResponse]:
        await self._ensure_user_exists(user_id)
        preferences = await self.repository.list_for_user(user_id)
        return [self._build_response(preference) for preference in preferences]

    async def get(self, user_id: str, movie_id: int) -> MoviePreferenceResponse:
        await self._ensure_user_exists(user_id)
        preference = await self.repository.find(user_id, movie_id)
        if preference is None:
            raise MoviePreferenceNotFoundError(movie_id)
        return self._build_response(preference)

    async def upsert(
        self,
        user_id: str,
        movie_id: int,
        data: MoviePreferenceUpsertRequest,
    ) -> MoviePreferenceResponse:
        await self._ensure_user_exists(user_id)
        preference = await self.repository.find(user_id, movie_id)

        if preference is None:
            movie = await self.movies.get_movie(movie_id)
            snapshot = MovieSnapshot(
                id=movie.id,
                title=movie.title,
                original_title=movie.original_title,
                original_language=movie.original_language,
                poster_url=movie.poster_url,
                backdrop_url=movie.backdrop_url,
                synopsis=movie.synopsis,
                release_date=movie.release_date,
                genre_ids=[genre.id for genre in movie.genres],
                popularity=movie.popularity,
            )
            try:
                preference = await self.repository.create(
                    user_id=user_id,
                    movie=snapshot,
                    status=data.status.value,
                    rating=data.rating,
                    is_favorite=data.is_favorite,
                )
            except DuplicateKeyError:
                # Two simultaneous first saves can race on the unique user/movie key.
                preference = await self.repository.find(user_id, movie_id)
                if preference is None:
                    raise
                preference = await self.repository.update(
                    preference,
                    status=data.status.value,
                    rating=data.rating,
                    is_favorite=data.is_favorite,
                )
        else:
            preference = await self.repository.update(
                preference,
                status=data.status.value,
                rating=data.rating,
                is_favorite=data.is_favorite,
            )

        return self._build_response(preference)

    async def _ensure_user_exists(self, user_id: str) -> None:
        if await self.users.find_by_id(user_id) is None:
            raise UserNotFoundError()

    @staticmethod
    def _build_response(preference: MoviePreference) -> MoviePreferenceResponse:
        return MoviePreferenceResponse(
            id=str(preference.id),
            user_id=preference.user_id,
            movie_id=preference.movie_id,
            status=preference.status,
            rating=preference.rating,
            is_favorite=preference.is_favorite,
            movie=MovieSummaryResponse.model_validate(preference.movie.model_dump()),
            created_at=preference.created_at,
            updated_at=preference.updated_at,
        )


movie_preference_service = MoviePreferenceService()
