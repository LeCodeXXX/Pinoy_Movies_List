"""MongoDB aggregation queries for app user ratings."""

from dataclasses import dataclass

from app.models.user_movie_data import MoviePreference


@dataclass(frozen=True)
class MovieRatingSummary:
    average: float = 0
    count: int = 0


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
                    "_id": "$movie_id",
                    "average": {"$avg": "$rating"},
                    "count": {"$sum": 1},
                }
            },
        ]
        results = await MoviePreference.aggregate(pipeline).to_list()
        return {
            result["_id"]: MovieRatingSummary(
                average=float(result["average"]),
                count=int(result["count"]),
            )
            for result in results
        }


movie_rating_repository = MovieRatingRepository()
