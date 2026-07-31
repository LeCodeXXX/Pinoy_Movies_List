"""Tests for unified movie-list preference business rules."""

from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase

from app.core.exceptions import UserNotFoundError
from app.models.user_movie_data import MoviePreference, MovieSnapshot, utc_now
from app.schemas.movie_preference import MovieListStatus, MoviePreferenceUpsertRequest
from app.services.movie_preference_service import MoviePreferenceService


class FakePreferenceRepository:
    def __init__(self) -> None:
        self.preferences: dict[tuple[str, int], MoviePreference] = {}

    async def find(self, user_id: str, movie_id: int) -> MoviePreference | None:
        return self.preferences.get((user_id, movie_id))

    async def list_for_user(self, user_id: str) -> list[MoviePreference]:
        return [item for item in self.preferences.values() if item.user_id == user_id]

    async def create(
        self,
        *,
        user_id: str,
        movie: MovieSnapshot,
        status: str,
        rating: int | None,
        is_favorite: bool,
    ) -> MoviePreference:
        preference = MoviePreference.model_construct(
            id="preference-1",
            user_id=user_id,
            movie_id=movie.id,
            movie=movie,
            status=status,
            rating=rating,
            is_favorite=is_favorite,
            created_at=utc_now(),
            updated_at=utc_now(),
        )
        self.preferences[(user_id, movie.id)] = preference
        return preference

    async def update(
        self,
        preference: MoviePreference,
        *,
        status: str,
        rating: int | None,
        is_favorite: bool,
    ) -> MoviePreference:
        preference.status = status
        preference.rating = rating
        preference.is_favorite = is_favorite
        preference.updated_at = utc_now()
        return preference


class FakeUsers:
    def __init__(self, exists: bool = True) -> None:
        self.exists = exists

    async def find_by_id(self, _: str) -> object | None:
        return object() if self.exists else None


class FakeMovies:
    def __init__(self) -> None:
        self.calls = 0

    async def get_movie(self, movie_id: int):
        self.calls += 1
        return SimpleNamespace(
            id=movie_id,
            title="Heneral Luna",
            original_title="Heneral Luna",
            original_language="tl",
            poster_url="https://image.tmdb.org/poster.jpg",
            backdrop_url=None,
            synopsis="A historical film.",
            release_date=None,
            genres=[SimpleNamespace(id=18)],
            popularity=10.0,
        )


class MoviePreferenceServiceTests(IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        self.repository = FakePreferenceRepository()
        self.movies = FakeMovies()
        self.service = MoviePreferenceService(
            self.repository,  # type: ignore[arg-type]
            FakeUsers(),  # type: ignore[arg-type]
            self.movies,  # type: ignore[arg-type]
        )

    async def test_create_saves_status_rating_favorite_and_movie_snapshot(self) -> None:
        saved = await self.service.upsert(
            "user-1",
            359105,
            MoviePreferenceUpsertRequest(
                status=MovieListStatus.completed,
                rating=9,
                is_favorite=True,
            ),
        )

        self.assertEqual(saved.movie.title, "Heneral Luna")
        self.assertEqual(saved.status, MovieListStatus.completed)
        self.assertEqual(saved.rating, 9)
        self.assertTrue(saved.is_favorite)
        self.assertEqual(self.movies.calls, 1)

    async def test_update_reuses_snapshot_without_another_tmdb_request(self) -> None:
        await self.service.upsert(
            "user-1",
            359105,
            MoviePreferenceUpsertRequest(status=MovieListStatus.plan_to_watch),
        )
        updated = await self.service.upsert(
            "user-1",
            359105,
            MoviePreferenceUpsertRequest(
                status=MovieListStatus.watching,
                rating=7,
            ),
        )

        self.assertEqual(updated.status, MovieListStatus.watching)
        self.assertEqual(updated.rating, 7)
        self.assertEqual(self.movies.calls, 1)

    async def test_missing_user_is_rejected_before_saving(self) -> None:
        service = MoviePreferenceService(
            self.repository,  # type: ignore[arg-type]
            FakeUsers(exists=False),  # type: ignore[arg-type]
            self.movies,  # type: ignore[arg-type]
        )

        with self.assertRaises(UserNotFoundError):
            await service.upsert(
                "missing-user",
                359105,
                MoviePreferenceUpsertRequest(status=MovieListStatus.completed),
            )
