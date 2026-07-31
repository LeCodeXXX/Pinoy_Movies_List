"""Tests for user-authored movie review business rules."""

from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase

from app.core.exceptions import MovieReviewNotFoundError, UserNotFoundError
from app.models.user_movie_data import MovieSnapshot, Review, utc_now
from app.schemas.movie_review import MovieReviewUpsertRequest
from app.services.movie_review_service import MovieReviewService


class FakeReviewRepository:
    def __init__(self) -> None:
        self.reviews: dict[tuple[str, int], Review] = {}

    async def find(self, user_id: str, movie_id: int) -> Review | None:
        return self.reviews.get((user_id, movie_id))

    async def list_for_movie(self, movie_id: int) -> list[Review]:
        return [item for item in self.reviews.values() if item.movie_id == movie_id]

    async def list_for_user(self, user_id: str) -> list[Review]:
        return [item for item in self.reviews.values() if item.user_id == user_id]

    async def create(
        self,
        *,
        user_id: str,
        movie: MovieSnapshot,
        rating: int,
        review: str,
    ) -> Review:
        item = Review.model_construct(
            id="review-1",
            user_id=user_id,
            movie_id=movie.id,
            movie=movie,
            rating=rating,
            review=review,
            created_at=utc_now(),
            updated_at=utc_now(),
        )
        self.reviews[(user_id, movie.id)] = item
        return item

    async def update(self, item: Review, *, rating: int, review: str) -> Review:
        item.rating = rating
        item.review = review
        item.updated_at = utc_now()
        return item


class FakeUsers:
    def __init__(self, exists: bool = True) -> None:
        self.exists = exists
        self.user = SimpleNamespace(
            id="user-1",
            username="movie_fan",
            display_name="Movie Fan",
            profile_picture=None,
        )

    async def find_by_id(self, _: str):
        return self.user if self.exists else None


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


class MovieReviewServiceTests(IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        self.repository = FakeReviewRepository()
        self.movies = FakeMovies()
        self.service = MovieReviewService(
            self.repository,  # type: ignore[arg-type]
            FakeUsers(),  # type: ignore[arg-type]
            self.movies,  # type: ignore[arg-type]
        )

    async def test_create_saves_required_rating_comment_and_movie_snapshot(self) -> None:
        saved = await self.service.upsert(
            "user-1",
            359105,
            MovieReviewUpsertRequest(rating=9, review="  A stirring film.  "),
        )

        self.assertEqual(saved.rating, 9)
        self.assertEqual(saved.review, "A stirring film.")
        self.assertEqual(saved.movie.title, "Heneral Luna")
        self.assertEqual(saved.author.display_name, "Movie Fan")
        self.assertEqual(self.movies.calls, 1)

    async def test_update_reuses_snapshot_and_updates_single_review(self) -> None:
        await self.service.upsert(
            "user-1",
            359105,
            MovieReviewUpsertRequest(rating=8, review="First thought."),
        )
        updated = await self.service.upsert(
            "user-1",
            359105,
            MovieReviewUpsertRequest(rating=10, review="Updated thought."),
        )

        self.assertEqual(updated.rating, 10)
        self.assertEqual(updated.review, "Updated thought.")
        self.assertEqual(self.movies.calls, 1)

    async def test_get_missing_review_raises_not_found(self) -> None:
        with self.assertRaises(MovieReviewNotFoundError):
            await self.service.get("user-1", 359105)

    async def test_missing_user_is_rejected_before_saving(self) -> None:
        service = MovieReviewService(
            self.repository,  # type: ignore[arg-type]
            FakeUsers(exists=False),  # type: ignore[arg-type]
            self.movies,  # type: ignore[arg-type]
        )

        with self.assertRaises(UserNotFoundError):
            await service.upsert(
                "missing-user",
                359105,
                MovieReviewUpsertRequest(rating=7, review="A review."),
            )
