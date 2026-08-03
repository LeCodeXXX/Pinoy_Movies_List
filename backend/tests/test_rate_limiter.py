"""Integration coverage for SlowAPI route groups and the safety cap."""

import unittest
from unittest.mock import AsyncMock, patch

from fastapi import Request
from fastapi.testclient import TestClient

from app.main import app
from app.middleware.rate_limiter import limiter, user_or_ip


EMPTY_MOVIE_LIST = {
    "page": 1,
    "total_pages": 0,
    "total_results": 0,
    "results": [],
}
EMPTY_RANKINGS = {"popular": [], "rated": [], "voted": []}


class RateLimiterTests(unittest.TestCase):
    def setUp(self) -> None:
        limiter.reset()
        self.client = TestClient(app)

    def test_catalog_routes_share_one_sixty_request_bucket(self) -> None:
        with (
            patch(
                "app.controllers.movie_controller.discover",
                new=AsyncMock(return_value=EMPTY_MOVIE_LIST),
            ),
            patch(
                "app.controllers.movie_controller.get_rankings",
                new=AsyncMock(return_value=EMPTY_RANKINGS),
            ),
        ):
            responses = [self.client.get("/api/movies") for _ in range(30)]
            responses += [
                self.client.get("/api/movies/rankings") for _ in range(30)
            ]
            blocked = self.client.get("/api/movies")

        self.assertTrue(all(response.status_code == 200 for response in responses))
        self.assertEqual(responses[0].headers["X-RateLimit-Limit"], "60")
        self.assertEqual(blocked.status_code, 429)

    def test_search_has_a_separate_ten_request_bucket(self) -> None:
        with (
            patch(
                "app.controllers.movie_controller.search",
                new=AsyncMock(return_value=EMPTY_MOVIE_LIST),
            ),
            patch(
                "app.controllers.movie_controller.discover",
                new=AsyncMock(return_value=EMPTY_MOVIE_LIST),
            ),
        ):
            responses = [
                self.client.get("/api/movies/search", params={"query": "Maynila"})
                for _ in range(10)
            ]
            blocked = self.client.get(
                "/api/movies/search", params={"query": "Maynila"}
            )
            catalog_response = self.client.get("/api/movies")

        self.assertTrue(all(response.status_code == 200 for response in responses))
        self.assertEqual(responses[0].headers["X-RateLimit-Limit"], "10")
        self.assertEqual(blocked.status_code, 429)
        self.assertEqual(catalog_response.status_code, 200)

    def test_application_safety_cap_applies_across_the_app(self) -> None:
        responses = [self.client.get("/") for _ in range(120)]
        blocked = self.client.get("/")

        self.assertTrue(all(response.status_code == 200 for response in responses))
        self.assertEqual(blocked.status_code, 429)

    def test_authenticated_users_are_not_grouped_by_ip(self) -> None:
        request = Request(
            {
                "type": "http",
                "headers": [],
                "client": ("203.0.113.10", 1234),
                "state": {"user_id": "user-42"},
            }
        )

        self.assertEqual(user_or_ip(request), "user:user-42")


if __name__ == "__main__":
    unittest.main()
