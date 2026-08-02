"""Retrieve normalized people and production-company filmographies from TMDB."""

import asyncio
from math import ceil
from typing import Any

from app.core.config import settings
from app.schemas.credit import CreditMoviesResponse, CreditProfileResponse
from app.services.content_safety_service import ContentSafetyService, content_safety_service
from app.services.movie_service import MovieService, movie_service
from app.services.tmdb_client import TmdbClient, tmdb_client


class CreditService:
    def __init__(self, client: TmdbClient, movies: MovieService = movie_service, safety: ContentSafetyService = content_safety_service) -> None:
        self.client = client
        self.movies = movies
        self.safety = safety

    async def get_person(self, person_id: int, page: int, page_size: int, language: str) -> CreditMoviesResponse:
        data = await self.client.get(f"/person/{person_id}", params={"language": language, "append_to_response": "combined_credits"})
        profile = CreditProfileResponse(
            id=person_id,
            name=data.get("name") or "Unknown person",
            description=data.get("biography") or "",
            image_url=self._image_url(data.get("profile_path"), "w342"),
            kind="person",
            role=data.get("known_for_department") or None,
        )
        credits = (data.get("combined_credits") or {}).get("cast") or []
        credits += (data.get("combined_credits") or {}).get("crew") or []
        movies = self._unique_movies(credits)
        return await self._response(profile, movies, page, page_size)

    async def get_company(self, company_id: int, page: int, page_size: int, language: str) -> CreditMoviesResponse:
        tmdb_page_size = 20
        first_index = (page - 1) * page_size
        first_tmdb_page = first_index // tmdb_page_size + 1
        last_tmdb_page = (first_index + page_size - 1) // tmdb_page_size + 1
        profile_data, *movie_pages = await asyncio.gather(
            self.client.get(f"/company/{company_id}", params={"language": language}),
            *(
                self.client.get("/discover/movie", params={
                    "with_companies": company_id,
                    "page": tmdb_page,
                    "language": language,
                    "region": settings.tmdb_default_region,
                    "include_adult": False,
                    "without_companies": self.safety.excluded_company_ids_parameter,
                    "sort_by": "primary_release_date.desc",
                })
                for tmdb_page in range(first_tmdb_page, last_tmdb_page + 1)
            ),
        )
        profile = CreditProfileResponse(
            id=company_id,
            name=profile_data.get("name") or "Unknown company",
            description=profile_data.get("description") or "",
            image_url=self._image_url(profile_data.get("logo_path"), "w342"),
            kind="company",
            role="Production company",
        )
        total_results = movie_pages[0].get("total_results") or 0
        results = self.safety.filter_movies([
            movie for movie_data in movie_pages for movie in movie_data.get("results") or []
        ])
        offset = first_index % tmdb_page_size
        summaries = await self.movies._build_summaries(results[offset:offset + page_size])
        return CreditMoviesResponse(
            profile=profile,
            page=page,
            total_pages=ceil(total_results / page_size) if total_results else 0,
            total_results=total_results,
            results=summaries,
        )

    async def _response(self, profile: CreditProfileResponse, movies: list[dict[str, Any]], page: int, page_size: int) -> CreditMoviesResponse:
        total_results = len(movies)
        start = (page - 1) * page_size
        summaries = await self.movies._build_summaries(movies[start:start + page_size])
        return CreditMoviesResponse(profile=profile, page=page, total_pages=ceil(total_results / page_size) if total_results else 0, total_results=total_results, results=summaries)

    def _unique_movies(self, credits: list[dict[str, Any]]) -> list[dict[str, Any]]:
        movies: list[dict[str, Any]] = []
        seen: set[int] = set()
        for credit in sorted(credits, key=lambda item: (item.get("release_date") or "", item.get("popularity") or 0), reverse=True):
            movie_id = credit.get("id")
            if not isinstance(movie_id, int) or movie_id in seen or credit.get("media_type") not in (None, "movie"):
                continue
            if not self.safety.is_movie_allowed(credit):
                continue
            seen.add(movie_id)
            movies.append(credit)
        return movies

    @staticmethod
    def _image_url(path: str | None, size: str) -> str | None:
        return f"{settings.tmdb_image_base_url}/{size}{path}" if path else None


credit_service = CreditService(tmdb_client)
