"""Movie metadata endpoints backed by TMDB."""

from typing import Annotated, Literal

from fastapi import APIRouter, Path, Query, Request, Response

from app.core.config import settings
from app.schemas.movie import MovieDetailResponse, MovieListResponse
from app.schemas.movie_ranking import MovieRankingResponse
from app.controllers import movie_controller
from app.middleware.rate_limiter import (
    catalog_limit,
    movie_detail_limit,
    search_limit,
)

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("/rankings", response_model=MovieRankingResponse)
@catalog_limit
async def get_movie_rankings(
    request: Request,
    response: Response,
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
) -> MovieRankingResponse:
    return await movie_controller.get_rankings(limit)


@router.get("", response_model=MovieListResponse)
@catalog_limit
async def discover_movies(
    request: Request,
    response: Response,
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
    return await movie_controller.discover(page, language, sort_by, genre_id, page_size)


@router.get("/search", response_model=MovieListResponse)
@search_limit
async def search_movies(
    request: Request,
    response: Response,
    query: Annotated[str, Query(min_length=1, max_length=200, pattern=r".*\S.*")],
    page: Annotated[int, Query(ge=1, le=500)] = 1,
    language: Annotated[str, Query(min_length=2, max_length=10)] = settings.tmdb_default_language,
) -> MovieListResponse:
    return await movie_controller.search(query, page, language)


@router.get("/{movie_id}", response_model=MovieDetailResponse)
@movie_detail_limit
async def get_movie(
    request: Request,
    response: Response,
    movie_id: Annotated[int, Path(ge=1)],
    language: Annotated[str, Query(min_length=2, max_length=10)] = settings.tmdb_default_language,
    region: Annotated[str, Query(min_length=2, max_length=2)] = settings.tmdb_default_region,
) -> MovieDetailResponse:
    return await movie_controller.get_movie(movie_id, language, region)
