"""Retrieve and normalize movie metadata from TMDB."""

from typing import Any

from app.core.config import settings
from app.schemas.movie import (
    CastMemberResponse,
    CrewMemberResponse,
    GenreResponse,
    MovieDetailResponse,
    MovieListResponse,
    MovieSummaryResponse,
    ProductionCompanyResponse,
    SpokenLanguageResponse,
    StreamingAvailabilityResponse,
    TrailerResponse,
    WatchProviderResponse,
)
from app.services.tmdb_client import TmdbClient, tmdb_client

DETAIL_APPENDICES = "credits,videos,watch/providers,similar"
WRITING_JOBS = {"Screenplay", "Story", "Teleplay", "Writer"}
MAX_CAST_MEMBERS = 20
MAX_SIMILAR_MOVIES = 12


class MovieService:
    def __init__(self, client: TmdbClient) -> None:
        self.client = client

    async def get_movie(
        self,
        movie_id: int,
        language: str = settings.tmdb_default_language,
        region: str = settings.tmdb_default_region,
    ) -> MovieDetailResponse:
        data = await self.client.get(
            f"/movie/{movie_id}",
            params={
                "language": language,
                "append_to_response": DETAIL_APPENDICES,
            },
            movie_id=movie_id,
        )
        return self._build_movie_detail(data, region)

    async def discover_philippine_movies(
        self,
        page: int,
        language: str,
        sort_by: str,
    ) -> MovieListResponse:
        data = await self.client.get(
            "/discover/movie",
            params={
                "page": page,
                "language": language,
                "region": settings.tmdb_default_region,
                "with_origin_country": settings.tmdb_default_region,
                "include_adult": False,
                "include_video": False,
                "sort_by": sort_by,
            },
        )
        return self._build_movie_list(data)

    async def search_movies(
        self,
        query: str,
        page: int,
        language: str,
    ) -> MovieListResponse:
        data = await self.client.get(
            "/search/movie",
            params={
                "query": query,
                "page": page,
                "language": language,
                "region": settings.tmdb_default_region,
                "include_adult": False,
            },
        )
        return self._build_movie_list(data)

    def _build_movie_detail(
        self,
        data: dict[str, Any],
        region: str,
    ) -> MovieDetailResponse:
        credits = data.get("credits") or {}
        crew = credits.get("crew") or []
        providers = data.get("watch/providers") or {}
        return MovieDetailResponse(
            id=data["id"],
            title=data.get("title") or data.get("original_title") or "",
            original_title=data.get("original_title") or data.get("title") or "",
            original_language=data.get("original_language") or "",
            poster_url=self._image_url(data.get("poster_path"), "w500"),
            backdrop_url=self._image_url(data.get("backdrop_path"), "original"),
            synopsis=data.get("overview") or "",
            tagline=data.get("tagline") or None,
            release_date=data.get("release_date") or None,
            runtime=data.get("runtime"),
            status=data.get("status"),
            genres=[GenreResponse(**genre) for genre in data.get("genres") or []],
            cast=self._build_cast(credits.get("cast") or []),
            director=self._find_director(crew),
            writers=self._find_writers(crew),
            trailer=self._find_trailer(data.get("videos") or {}),
            production_companies=self._build_companies(data),
            spoken_languages=self._build_languages(data),
            budget=data.get("budget") or 0,
            revenue=data.get("revenue") or 0,
            homepage=data.get("homepage") or None,
            imdb_id=data.get("imdb_id") or None,
            popularity=data.get("popularity") or 0,
            tmdb_vote_average=data.get("vote_average") or 0,
            tmdb_vote_count=data.get("vote_count") or 0,
            streaming_availability=self._build_availability(providers, region),
            similar_movies=self._build_summaries(
                (data.get("similar") or {}).get("results") or [],
                MAX_SIMILAR_MOVIES,
            ),
        )

    def _build_movie_list(self, data: dict[str, Any]) -> MovieListResponse:
        return MovieListResponse(
            page=data.get("page") or 1,
            total_pages=data.get("total_pages") or 0,
            total_results=data.get("total_results") or 0,
            results=self._build_summaries(data.get("results") or []),
        )

    def _build_summaries(
        self,
        movies: list[dict[str, Any]],
        limit: int | None = None,
    ) -> list[MovieSummaryResponse]:
        selected_movies = movies[:limit] if limit is not None else movies
        return [self._build_summary(movie) for movie in selected_movies]

    def _build_summary(self, movie: dict[str, Any]) -> MovieSummaryResponse:
        return MovieSummaryResponse(
            id=movie["id"],
            title=movie.get("title") or movie.get("original_title") or "",
            original_title=movie.get("original_title") or movie.get("title") or "",
            original_language=movie.get("original_language") or "",
            poster_url=self._image_url(movie.get("poster_path"), "w500"),
            backdrop_url=self._image_url(movie.get("backdrop_path"), "original"),
            synopsis=movie.get("overview") or "",
            release_date=movie.get("release_date") or None,
            genre_ids=movie.get("genre_ids") or [],
            popularity=movie.get("popularity") or 0,
            tmdb_vote_average=movie.get("vote_average") or 0,
            tmdb_vote_count=movie.get("vote_count") or 0,
        )

    def _build_cast(self, cast: list[dict[str, Any]]) -> list[CastMemberResponse]:
        ordered_cast = sorted(cast, key=lambda member: member.get("order", 9999))
        return [
            CastMemberResponse(
                id=member["id"],
                name=member.get("name") or member.get("original_name") or "",
                character=member.get("character") or None,
                profile_url=self._image_url(member.get("profile_path"), "w185"),
            )
            for member in ordered_cast[:MAX_CAST_MEMBERS]
        ]

    def _find_director(self, crew: list[dict[str, Any]]) -> CrewMemberResponse | None:
        director = next((member for member in crew if member.get("job") == "Director"), None)
        return self._build_crew_member(director) if director else None

    def _find_writers(self, crew: list[dict[str, Any]]) -> list[CrewMemberResponse]:
        writers: list[CrewMemberResponse] = []
        seen_people: set[int] = set()
        for member in crew:
            if member.get("job") not in WRITING_JOBS or member["id"] in seen_people:
                continue
            writers.append(self._build_crew_member(member))
            seen_people.add(member["id"])
        return writers

    def _build_crew_member(self, member: dict[str, Any]) -> CrewMemberResponse:
        return CrewMemberResponse(
            id=member["id"],
            name=member.get("name") or member.get("original_name") or "",
            job=member.get("job") or "",
            profile_url=self._image_url(member.get("profile_path"), "w185"),
        )

    @staticmethod
    def _find_trailer(videos: dict[str, Any]) -> TrailerResponse | None:
        candidates = [
            video
            for video in videos.get("results") or []
            if video.get("site") == "YouTube"
        ]
        if not candidates:
            return None
        trailer = next(
            (
                video
                for video in candidates
                if video.get("type") == "Trailer" and video.get("official")
            ),
            next((video for video in candidates if video.get("type") == "Trailer"), candidates[0]),
        )
        key = trailer["key"]
        return TrailerResponse(
            name=trailer.get("name") or "Trailer",
            youtube_key=key,
            url=f"https://www.youtube.com/watch?v={key}",
        )

    def _build_companies(self, data: dict[str, Any]) -> list[ProductionCompanyResponse]:
        return [
            ProductionCompanyResponse(
                id=company["id"],
                name=company.get("name") or "",
                logo_url=self._image_url(company.get("logo_path"), "w185"),
                origin_country=company.get("origin_country") or None,
            )
            for company in data.get("production_companies") or []
        ]

    @staticmethod
    def _build_languages(data: dict[str, Any]) -> list[SpokenLanguageResponse]:
        return [
            SpokenLanguageResponse(
                code=language.get("iso_639_1") or "",
                name=language.get("english_name") or language.get("name") or "",
            )
            for language in data.get("spoken_languages") or []
        ]

    def _build_availability(
        self,
        providers: dict[str, Any],
        region: str,
    ) -> StreamingAvailabilityResponse:
        region_data = (providers.get("results") or {}).get(region.upper()) or {}
        return StreamingAvailabilityResponse(
            link=region_data.get("link"),
            streaming=self._build_providers(region_data.get("flatrate") or []),
            free=self._build_providers(region_data.get("free") or []),
            ads=self._build_providers(region_data.get("ads") or []),
            rent=self._build_providers(region_data.get("rent") or []),
            buy=self._build_providers(region_data.get("buy") or []),
        )

    def _build_providers(self, providers: list[dict[str, Any]]) -> list[WatchProviderResponse]:
        return [
            WatchProviderResponse(
                id=provider["provider_id"],
                name=provider.get("provider_name") or "",
                logo_url=self._image_url(provider.get("logo_path"), "w185"),
            )
            for provider in sorted(providers, key=lambda item: item.get("display_priority", 9999))
        ]

    @staticmethod
    def _image_url(path: str | None, size: str) -> str | None:
        if not path:
            return None
        return f"{settings.tmdb_image_base_url}/{size}{path}"


movie_service = MovieService(tmdb_client)
