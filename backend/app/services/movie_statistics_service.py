"""Keep the MongoDB movie statistics document in sync with user activity."""

from app.models.movie_statistic import MovieStatistic
from app.models.user_movie_data import MoviePreference, Review


class MovieStatisticsService:
    async def refresh(self, movie_id: int) -> None:
        preferences = await MoviePreference.find(MoviePreference.movie_id == movie_id).to_list()
        reviews = await Review.find(Review.movie_id == movie_id).to_list()
        rated_preferences = [item for item in preferences if item.rating is not None]
        ratings = [float(item.rating) for item in rated_preferences]
        snapshot = next((item.movie for item in preferences), None) or next((item.movie for item in reviews), None)
        statistic = await MovieStatistic.find_one(MovieStatistic.movie_id == movie_id)
        if statistic is None:
            statistic = MovieStatistic(movie_id=movie_id)
        if snapshot is not None:
            statistic.title = snapshot.title
            statistic.poster = snapshot.poster_url
        statistic.average_rating = sum(ratings) / len(ratings) if ratings else 0
        statistic.total_ratings = len(ratings)
        statistic.total_reviews = len(reviews)
        statistic.total_favorites = sum(1 for item in preferences if item.is_favorite)
        statistic.total_watched = sum(1 for item in preferences if item.status == 'completed')
        await statistic.save()


movie_statistics_service = MovieStatisticsService()
