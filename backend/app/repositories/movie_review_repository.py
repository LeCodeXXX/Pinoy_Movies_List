"""Persistence operations for user-authored movie reviews."""

from app.models.user_movie_data import MovieSnapshot, Review, utc_now


class MovieReviewRepository:
    async def find(self, user_id: str, movie_id: int) -> Review | None:
        return await Review.find_one(
            Review.user_id == user_id,
            Review.movie_id == movie_id,
        )

    async def list_for_movie(self, movie_id: int) -> list[Review]:
        return await Review.find(Review.movie_id == movie_id).sort("-updated_at").to_list()

    async def list_for_user(self, user_id: str) -> list[Review]:
        return await Review.find(Review.user_id == user_id).sort("-updated_at").to_list()

    async def create(
        self,
        *,
        user_id: str,
        movie: MovieSnapshot,
        rating: float,
        review: str,
    ) -> Review:
        item = Review(
            user_id=user_id,
            movie_id=movie.id,
            movie=movie,
            rating=rating,
            review=review,
        )
        await item.insert()
        return item

    async def update(self, item: Review, *, rating: float, review: str) -> Review:
        item.rating = rating
        item.review = review
        item.updated_at = utc_now()
        await item.save()
        return item


movie_review_repository = MovieReviewRepository()
