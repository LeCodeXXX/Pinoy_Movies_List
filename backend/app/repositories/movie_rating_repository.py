"""MongoDB aggregation queries for app user ratings."""

from dataclasses import dataclass

from app.models.user_movie_data import MoviePreference


@dataclass(frozen=True)
class MovieRatingSummary:
    average: float = 0
    count: int = 0
    distribution: tuple[int, ...] = (0,) * 10


class MovieRatingRepository:
    async def summarize(
        self,
        movie_ids: list[int],
    ) -> dict[int, MovieRatingSummary]:
        if not movie_ids:
            return {}

        pipeline = [
            {
                "$match": {
                    "movie_id": {"$in": sorted(set(movie_ids))},
                    "rating": {"$gte": 1, "$lte": 10},
                }
            },
            {
                "$group": {
                    "_id": {"movie_id": "$movie_id", "rating": "$rating"},
                    "count": {"$sum": 1},
                }
            },
        ]
        results = await MoviePreference.aggregate(pipeline).to_list()
        distributions: dict[int, list[int]] = {}
        for result in results:
            movie_id = int(result["_id"]["movie_id"])
            rating = int(round(float(result["_id"]["rating"])))
            if 1 <= rating <= 10:
                distributions.setdefault(movie_id, [0] * 10)[rating - 1] = int(result["count"])

        return {
            movie_id: MovieRatingSummary(
                average=sum((index + 1) * count for index, count in enumerate(distribution))
                / sum(distribution),
                count=sum(distribution),
                distribution=tuple(distribution),
            )
            for movie_id, distribution in distributions.items()
        }


movie_rating_repository = MovieRatingRepository()
