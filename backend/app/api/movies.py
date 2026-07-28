"""Movie metadata endpoints backed by TMDB."""

from typing import Annotated, Literal

from fastapi import APIRouter, Path, Query

from app.core.config import settings
from app.schemas.movie import MovieDetailResponse, MovieListResponse
from app.services.movie_service import movie_service

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("", response_model=MovieListResponse)
async def discover_movies(
    page: Annotated[int, Query(ge=1, le=500)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    genre_id: Annotated[int | None, Query(ge=1)] = None,
    language: Annotated[str, Query(min_length=2, max_length=10)] = settings.tmdb_default_language,
    sort_by: Literal[
        "popularity.desc",
        "primary_release_date.desc",
        "revenue.desc",
        "vote_average.desc",
        "vote_count.desc",
    ] = "popularity.desc",
) -> MovieListResponse:
    return await movie_service.discover_philippine_movies(
        page,
        language,
        sort_by,
        genre_id=genre_id,
        page_size=page_size,
    )


@router.get("/search", response_model=MovieListResponse)
async def search_movies(
    query: Annotated[str, Query(min_length=1, max_length=200, pattern=r".*\S.*")],
    page: Annotated[int, Query(ge=1, le=500)] = 1,
    language: Annotated[str, Query(min_length=2, max_length=10)] = settings.tmdb_default_language,
) -> MovieListResponse:
    return await movie_service.search_movies(query.strip(), page, language)


@router.get("/{movie_id}", response_model=MovieDetailResponse)
async def get_movie(
    movie_id: Annotated[int, Path(ge=1)],
    language: Annotated[str, Query(min_length=2, max_length=10)] = settings.tmdb_default_language,
    region: Annotated[str, Query(min_length=2, max_length=2)] = settings.tmdb_default_region,
) -> MovieDetailResponse:
    return await movie_service.get_movie(movie_id, language, region.upper())
