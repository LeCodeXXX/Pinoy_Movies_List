"""Tests for retrieving and normalizing TMDB movie data."""

from typing import Any
from unittest import IsolatedAsyncioTestCase

from app.repositories.movie_rating_repository import MovieRatingSummary
from app.services.movie_service import DETAIL_APPENDICES, MovieService


class FakeTmdbClient:
    def __init__(
        self,
        response: dict[str, Any],
        movie_responses: dict[int, dict[str, Any]] | None = None,
    ) -> None:
        self.response = response
        self.movie_responses = movie_responses or {}
        self.path: str | None = None
        self.params: dict[str, str | int | bool] | None = None
        self.movie_id: int | None = None

    async def get(
        self,
        path: str,
        params: dict[str, str | int | bool] | None = None,
        movie_id: int | None = None,
    ) -> dict[str, Any]:
        self.path = path
        self.params = params
        self.movie_id = movie_id
        return self.movie_responses.get(movie_id, self.response)


class FakeMovieRatingRepository:
    def __init__(
        self,
        summaries: dict[int, MovieRatingSummary] | None = None,
    ) -> None:
        self.summaries = summaries or {}
        self.requested_movie_ids: list[int] = []

    async def summarize(
        self,
        movie_ids: list[int],
    ) -> dict[int, MovieRatingSummary]:
        self.requested_movie_ids = movie_ids
        return {
            movie_id: self.summaries[movie_id]
            for movie_id in movie_ids
            if movie_id in self.summaries
        }


class MovieServiceTests(IsolatedAsyncioTestCase):
    async def test_get_movie_normalizes_appended_tmdb_data(self) -> None:
        client = FakeTmdbClient(
            {
                "id": 770,
                "title": "Sample Film",
                "original_title": "Sample Film",
                "original_language": "tl",
                "overview": "A sample synopsis.",
                "vote_average": 9.9,
                "vote_count": 50_000,
                "poster_path": "/poster.jpg",
                "backdrop_path": "/backdrop.jpg",
                "release_date": "2026-01-02",
                "genres": [{"id": 18, "name": "Drama"}],
                "credits": {
                    "cast": [
                        {
                            "id": 1,
                            "name": "Actor",
                            "character": "Lead",
                            "order": 0,
                        }
                    ],
                    "crew": [
                        {"id": 2, "name": "Director", "job": "Director"},
                        {"id": 3, "name": "Writer", "job": "Screenplay"},
                    ],
                },
                "videos": {
                    "results": [
                        {
                            "key": "trailer-key",
                            "name": "Official Trailer",
                            "site": "YouTube",
                            "type": "Trailer",
                            "official": True,
                        }
                    ]
                },
                "watch/providers": {
                    "results": {
                        "PH": {
                            "link": "https://example.test/watch",
                            "flatrate": [
                                {
                                    "provider_id": 8,
                                    "provider_name": "Provider",
                                    "logo_path": "/provider.jpg",
                                }
                            ],
                        }
                    }
                },
                "similar": {"results": []},
            }
        )
        ratings = FakeMovieRatingRepository(
            {770: MovieRatingSummary(average=8.5, count=2)}
        )
        service = MovieService(  # type: ignore[arg-type]
            client,
            rating_repository=ratings,
        )

        movie = await service.get_movie(770)

        self.assertEqual(client.path, "/movie/770")
        self.assertEqual(client.movie_id, 770)
        self.assertEqual(client.params["append_to_response"], DETAIL_APPENDICES)
        self.assertEqual(movie.director.name, "Director")
        self.assertEqual(movie.trailer.youtube_key, "trailer-key")
        self.assertEqual(movie.streaming_availability.streaming[0].name, "Provider")
        self.assertTrue(movie.poster_url.endswith("/w500/poster.jpg"))
        self.assertEqual(movie.vote_average, 8.5)
        self.assertEqual(movie.vote_count, 2)
        self.assertEqual(ratings.requested_movie_ids, [770])

    async def test_discover_limits_results_to_philippine_origin(self) -> None:
        client = FakeTmdbClient(
            {
                "page": 1,
                "total_pages": 1,
                "total_results": 1,
                "results": [
                    {
                        "id": 42,
                        "title": "Filipino Film",
                        "original_title": "Filipino Film",
                        "original_language": "tl",
                        "overview": "",
                        "vote_average": 9.8,
                        "vote_count": 25_000,
                    }
                ],
            }
        )
        ratings = FakeMovieRatingRepository(
            {42: MovieRatingSummary(average=7.5, count=4)}
        )
        service = MovieService(  # type: ignore[arg-type]
            client,
            rating_repository=ratings,
        )

        movies = await service.discover_philippine_movies(1, "en-US", "popularity.desc")

        self.assertEqual(client.path, "/discover/movie")
        self.assertEqual(client.params["with_origin_country"], "PH")
        self.assertEqual(client.params["without_companies"], "149142")
        self.assertFalse(client.params["include_adult"])
        self.assertEqual(movies.results[0].id, 42)
        self.assertEqual(movies.results[0].vote_average, 7.5)
        self.assertEqual(movies.results[0].vote_count, 4)

    async def test_discover_supports_genre_and_custom_page_size(self) -> None:
        client = FakeTmdbClient(
            {
                "page": 1,
                "total_pages": 2,
                "total_results": 24,
                "results": [
                    {
                        "id": movie_id,
                        "title": f"Movie {movie_id}",
                        "original_title": f"Movie {movie_id}",
                        "original_language": "tl",
                        "overview": "",
                        "genre_ids": [10749],
                    }
                    for movie_id in range(1, 21)
                ],
            }
        )
        service = MovieService(  # type: ignore[arg-type]
            client,
            rating_repository=FakeMovieRatingRepository(),
        )

        movies = await service.discover_philippine_movies(
            1,
            "en-US",
            "popularity.desc",
            genre_id=10749,
            page_size=6,
        )

        self.assertEqual(client.params["with_genres"], 10749)
        self.assertEqual(len(movies.results), 6)
        self.assertEqual(movies.total_pages, 4)

    async def test_discover_removes_movies_repeated_across_tmdb_pages(self) -> None:
        client = FakeTmdbClient(
            {
                "page": 1,
                "total_pages": 2,
                "total_results": 40,
                "results": [
                    {
                        "id": movie_id,
                        "title": f"Movie {movie_id}",
                        "original_title": f"Movie {movie_id}",
                        "original_language": "tl",
                        "overview": "",
                    }
                    for movie_id in range(1, 21)
                ],
            }
        )
        service = MovieService(  # type: ignore[arg-type]
            client,
            rating_repository=FakeMovieRatingRepository(),
        )

        movies = await service.discover_philippine_movies(
            1,
            "en-US",
            "popularity.desc",
            page_size=30,
        )

        self.assertEqual([movie.id for movie in movies.results], list(range(1, 21)))

    async def test_search_removes_adult_and_explicit_results(self) -> None:
        safe_movie = {
            "id": 1,
            "title": "Family Story",
            "original_title": "Family Story",
            "original_language": "tl",
            "overview": "A family rebuilds their life together.",
        }
        client = FakeTmdbClient(
            {
                "page": 1,
                "total_pages": 1,
                "total_results": 3,
                "results": [
                    safe_movie,
                    {**safe_movie, "id": 2, "adult": True},
                    {**safe_movie, "id": 3, "title": "A Softcore Story"},
                ],
            },
            movie_responses={
                1: {"production_countries": [{"iso_3166_1": "PH"}]},
                2: {"production_countries": [{"iso_3166_1": "PH"}]},
                3: {"production_countries": [{"iso_3166_1": "PH"}]},
            },
        )
        service = MovieService(  # type: ignore[arg-type]
            client,
            rating_repository=FakeMovieRatingRepository(),
        )

        movies = await service.search_movies("story", 1, "en-US")

        self.assertEqual([movie.id for movie in movies.results], [1])

    async def test_search_limits_results_to_philippine_production_country(self) -> None:
        client = FakeTmdbClient(
            {
                "page": 1,
                "total_pages": 1,
                "total_results": 2,
                "results": [
                    {"id": 1, "title": "Pinoy Story", "original_title": "Pinoy Story"},
                    {"id": 2, "title": "Foreign Story", "original_title": "Foreign Story"},
                ],
            },
            movie_responses={
                1: {"production_countries": [{"iso_3166_1": "PH"}]},
                2: {"production_countries": [{"iso_3166_1": "US"}]},
            },
        )
        service = MovieService(  # type: ignore[arg-type]
            client,
            rating_repository=FakeMovieRatingRepository(),
        )

        movies = await service.search_movies("story", 1, "en-US")

        self.assertEqual([movie.id for movie in movies.results], [1])


if __name__ == "__main__":
    import unittest

    unittest.main()
