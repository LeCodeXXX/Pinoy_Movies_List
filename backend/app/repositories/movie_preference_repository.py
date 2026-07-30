"""Persistence operations for movie-list preferences."""

from app.models.user_movie_data import MoviePreference, MovieSnapshot, utc_now


class MoviePreferenceRepository:
    async def find(self, user_id: str, movie_id: int) -> MoviePreference | None:
        return await MoviePreference.find_one(
            MoviePreference.user_id == user_id,
            MoviePreference.movie_id == movie_id,
        )

    async def list_for_user(self, user_id: str) -> list[MoviePreference]:
        return await (
            MoviePreference.find(MoviePreference.user_id == user_id)
            .sort("-updated_at")
            .to_list()
        )

    async def create(
        self,
        *,
        user_id: str,
        movie: MovieSnapshot,
        status: str,
        rating: int | None,
        is_favorite: bool,
    ) -> MoviePreference:
        preference = MoviePreference(
            user_id=user_id,
            movie_id=movie.id,
            movie=movie,
            status=status,
            rating=rating,
            is_favorite=is_favorite,
        )
        await preference.insert()
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
        await preference.save()
        return preference


movie_preference_repository = MoviePreferenceRepository()
