"""Policy for preventing explicit movie metadata from reaching clients."""

import re
from typing import Any

from app.core.exceptions import MovieNotFoundError

VIVAMAX_COMPANY_IDS = frozenset({149142})
BLOCKED_KEYWORDS = frozenset(
    {
        "adult film",
        "erotic movie",
        "erotica",
        "hardcore",
        "pornographic film",
        "pornography",
        "sexploitation",
        "softcore",
        "vivamax",
        "vmx",
    }
)
EXPLICIT_TEXT_PATTERN = re.compile(
    r"\b(?:adult films?|erotic films?|erotica|hardcore|porn(?:ography|ographic|star)?|"
    r"sexploitation|softcore|vivamax|vmx)\b",
    re.IGNORECASE,
)


class ContentSafetyService:
    """Apply application-specific safety rules on top of TMDB's adult flag."""

    @property
    def excluded_company_ids_parameter(self) -> str:
        return "|".join(str(company_id) for company_id in sorted(VIVAMAX_COMPANY_IDS))

    def filter_movies(self, movies: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return [movie for movie in movies if self.is_movie_allowed(movie)]

    def ensure_movie_allowed(self, movie: dict[str, Any], movie_id: int) -> None:
        if not self.is_movie_allowed(movie):
            # Do not disclose filtered titles through direct-ID probing.
            raise MovieNotFoundError(movie_id)

    def is_movie_allowed(self, movie: dict[str, Any]) -> bool:
        if movie.get("adult") is True:
            return False
        if self._has_blocked_company(movie):
            return False
        if self._has_blocked_keyword(movie):
            return False
        return not self._has_explicit_text(movie)

    @staticmethod
    def _has_blocked_company(movie: dict[str, Any]) -> bool:
        company_ids = {
            company.get("id")
            for company in movie.get("production_companies") or []
        }
        return bool(company_ids & VIVAMAX_COMPANY_IDS)

    @staticmethod
    def _has_blocked_keyword(movie: dict[str, Any]) -> bool:
        keyword_data = movie.get("keywords") or {}
        keywords = keyword_data.get("keywords") or keyword_data.get("results") or []
        keyword_names = {
            str(keyword.get("name") or "").strip().casefold()
            for keyword in keywords
        }
        return bool(keyword_names & BLOCKED_KEYWORDS)

    @staticmethod
    def _has_explicit_text(movie: dict[str, Any]) -> bool:
        searchable_text = " ".join(
            str(movie.get(field) or "")
            for field in ("title", "original_title", "overview", "tagline")
        )
        return EXPLICIT_TEXT_PATTERN.search(searchable_text) is not None


content_safety_service = ContentSafetyService()
