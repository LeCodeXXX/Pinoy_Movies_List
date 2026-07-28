"""Tests for the explicit-content filtering policy."""

from unittest import TestCase

from app.core.exceptions import MovieNotFoundError
from app.services.content_safety_service import ContentSafetyService


class ContentSafetyServiceTests(TestCase):
    def setUp(self) -> None:
        self.service = ContentSafetyService()

    def test_rejects_tmdb_adult_flag(self) -> None:
        self.assertFalse(self.service.is_movie_allowed({"adult": True}))

    def test_rejects_vivamax_production_company(self) -> None:
        movie = {"production_companies": [{"id": 149142, "name": "Vivamax"}]}

        self.assertFalse(self.service.is_movie_allowed(movie))

    def test_rejects_explicit_keyword_metadata(self) -> None:
        movie = {"keywords": {"keywords": [{"id": 1, "name": "softcore"}]}}

        self.assertFalse(self.service.is_movie_allowed(movie))

    def test_allows_non_explicit_mature_drama(self) -> None:
        movie = {
            "adult": False,
            "title": "A Serious Drama",
            "overview": "Adults confront grief and rebuild their family.",
        }

        self.assertTrue(self.service.is_movie_allowed(movie))

    def test_direct_filtered_movie_looks_not_found(self) -> None:
        with self.assertRaises(MovieNotFoundError):
            self.service.ensure_movie_allowed({"adult": True}, 123)
