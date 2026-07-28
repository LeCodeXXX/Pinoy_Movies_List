"""Tests for retrieving and normalizing TMDB movie data."""

from typing import Any
from unittest import IsolatedAsyncioTestCase

from app.services.movie_service import DETAIL_APPENDICES, MovieService


class FakeTmdbClient:
    def __init__(self, response: dict[str, Any]) -> None:
        self.response = response
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
        return self.response


class MovieServiceTests(IsolatedAsyncioTestCase):
    async def test_get_movie_normalizes_appended_tmdb_data(self) -> None:
        client = FakeTmdbClient(
            {
                "id": 770,
                "title": "Sample Film",
                "original_title": "Sample Film",
                "original_language": "tl",
                "overview": "A sample synopsis.",
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
        service = MovieService(client)  # type: ignore[arg-type]

        movie = await service.get_movie(770)

        self.assertEqual(client.path, "/movie/770")
        self.assertEqual(client.movie_id, 770)
        self.assertEqual(client.params["append_to_response"], DETAIL_APPENDICES)
        self.assertEqual(movie.director.name, "Director")
        self.assertEqual(movie.trailer.youtube_key, "trailer-key")
        self.assertEqual(movie.streaming_availability.streaming[0].name, "Provider")
        self.assertTrue(movie.poster_url.endswith("/w500/poster.jpg"))

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
                    }
                ],
            }
        )
        service = MovieService(client)  # type: ignore[arg-type]

        movies = await service.discover_philippine_movies(1, "en-US", "popularity.desc")

        self.assertEqual(client.path, "/discover/movie")
        self.assertEqual(client.params["with_origin_country"], "PH")
        self.assertFalse(client.params["include_adult"])
        self.assertEqual(movies.results[0].id, 42)

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
        service = MovieService(client)  # type: ignore[arg-type]

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


if __name__ == "__main__":
    import unittest

    unittest.main()
