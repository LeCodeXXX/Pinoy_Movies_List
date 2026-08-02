"""Business rules for saving and retrieving movie reviews."""

from pymongo.errors import DuplicateKeyError

from app.core.exceptions import MovieReviewNotFoundError, UserNotFoundError
from app.models.user import User
from app.models.user_movie_data import MovieSnapshot, Review
from app.repositories.movie_review_repository import (
    MovieReviewRepository,
    movie_review_repository,
)
from app.repositories.user_repository import UserRepository, user_repository
from app.schemas.movie import MovieSummaryResponse
from app.schemas.movie_review import (
    MovieReviewResponse,
    MovieReviewUpsertRequest,
    ReviewAuthorResponse,
)
from app.services.movie_service import MovieService, movie_service
from app.services.movie_statistics_service import movie_statistics_service


class MovieReviewService:
    def __init__(
        self,
        repository: MovieReviewRepository = movie_review_repository,
        users: UserRepository = user_repository,
        movies: MovieService = movie_service,
    ) -> None:
        self.repository = repository
        self.users = users
        self.movies = movies

    async def list_for_movie(self, movie_id: int) -> list[MovieReviewResponse]:
        reviews = await self.repository.list_for_movie(movie_id)
        return await self._build_responses(reviews)

    async def list_for_user(self, user_id: str) -> list[MovieReviewResponse]:
        user = await self._get_user(user_id)
        reviews = await self.repository.list_for_user(user_id)
        return [self._build_response(review, user) for review in reviews]

    async def get(self, user_id: str, movie_id: int) -> MovieReviewResponse:
        user = await self._get_user(user_id)
        review = await self.repository.find(user_id, movie_id)
        if review is None:
            raise MovieReviewNotFoundError(movie_id)
        await movie_statistics_service.refresh(movie_id)
        return self._build_response(review, user)

    async def upsert(
        self,
        user_id: str,
        movie_id: int,
        data: MovieReviewUpsertRequest,
    ) -> MovieReviewResponse:
        user = await self._get_user(user_id)
        review = await self.repository.find(user_id, movie_id)

        if review is None:
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
                review = await self.repository.create(
                    user_id=user_id,
                    movie=snapshot,
                    rating=data.rating,
                    review=data.review,
                )
            except DuplicateKeyError:
                review = await self.repository.find(user_id, movie_id)
                if review is None:
                    raise
                review = await self.repository.update(
                    review,
                    rating=data.rating,
                    review=data.review,
                )
        else:
            review = await self.repository.update(
                review,
                rating=data.rating,
                review=data.review,
            )

        return self._build_response(review, user)

    async def _build_responses(self, reviews: list[Review]) -> list[MovieReviewResponse]:
        users: dict[str, User] = {}
        responses: list[MovieReviewResponse] = []
        for review in reviews:
            user = users.get(review.user_id)
            if user is None:
                found_user = await self.users.find_by_id(review.user_id)
                if found_user is None:
                    continue
                user = found_user
                users[review.user_id] = user
            responses.append(self._build_response(review, user))
        return responses

    async def _get_user(self, user_id: str) -> User:
        user = await self.users.find_by_id(user_id)
        if user is None:
            raise UserNotFoundError()
        return user

    @staticmethod
    def _build_response(review: Review, user: User) -> MovieReviewResponse:
        return MovieReviewResponse(
            id=str(review.id),
            user_id=review.user_id,
            movie_id=review.movie_id,
            rating=review.rating,
            review=review.review,
            movie=MovieSummaryResponse.model_validate(review.movie.model_dump()),
            author=ReviewAuthorResponse(
                id=str(user.id),
                username=user.username,
                display_name=user.display_name,
                profile_picture=user.profile_picture,
            ),
            created_at=review.created_at,
            updated_at=review.updated_at,
        )


movie_review_service = MovieReviewService()
