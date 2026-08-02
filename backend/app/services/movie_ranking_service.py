"""Rank movies using statistics stored in MongoDB."""

import asyncio

from app.models.movie_statistic import MovieStatistic
from app.models.user_movie_data import MoviePreference, Review
from app.schemas.movie import MovieSummaryResponse
from app.schemas.movie_ranking import MovieRankingResponse
from app.services.movie_statistics_service import movie_statistics_service


class MovieRankingService:
    async def get_rankings(self, limit: int = 10) -> MovieRankingResponse:
        # Backfill statistics for activity saved before the statistics updater
        # was introduced, so existing ratings are immediately rankable.
        preferences = await MoviePreference.find_all().to_list()
        reviews = await Review.find_all().to_list()
        movie_ids = {item.movie_id for item in preferences} | {item.movie_id for item in reviews}
        await asyncio.gather(*(movie_statistics_service.refresh(movie_id) for movie_id in movie_ids))
        statistics = await MovieStatistic.find(
            {
                "$or": [
                    {"total_ratings": {"$gt": 0}},
                    {"total_reviews": {"$gt": 0}},
                    {"total_favorites": {"$gt": 0}},
                    {"total_watched": {"$gt": 0}},
                ]
            }
        ).to_list()

        statistics_by_movie = {statistic.movie_id: statistic for statistic in statistics}
        movies = [self._summary(statistic) for statistic in statistics]
        rated_movies = [movie for movie in movies if movie.vote_average > 0 and movie.vote_count > 0]
        voted_movies = [movie for movie in movies if movie.vote_count > 0]
        return MovieRankingResponse(
            popular=sorted(
                movies,
                key=lambda movie: self._popularity_score(statistics_by_movie[movie.id]),
                reverse=True,
            )[:limit],
            rated=sorted(rated_movies, key=lambda movie: (movie.vote_average, movie.vote_count), reverse=True)[:limit],
            voted=sorted(voted_movies, key=lambda movie: movie.vote_count, reverse=True)[:limit],
        )

    @staticmethod
    def _summary(statistic: MovieStatistic) -> MovieSummaryResponse:
        return MovieSummaryResponse(
            id=statistic.movie_id,
            title=statistic.title or "Untitled movie",
            original_title=statistic.title or "Untitled movie",
            original_language="",
            poster_url=statistic.poster,
            synopsis="",
            popularity=MovieRankingService._popularity_score(statistic),
            vote_average=statistic.average_rating,
            vote_count=statistic.total_ratings,
        )

    @staticmethod
    def _popularity_score(statistic: MovieStatistic) -> float:
        return float(
            statistic.total_favorites * 3
            + statistic.total_watched
            + statistic.total_reviews * 2
            + statistic.total_ratings
        )


movie_ranking_service = MovieRankingService()
