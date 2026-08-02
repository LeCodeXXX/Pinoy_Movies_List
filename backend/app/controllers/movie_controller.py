"""Controllers for movie metadata and rankings."""

from app.schemas.movie import MovieDetailResponse, MovieListResponse
from app.schemas.movie_ranking import MovieRankingResponse
from app.services.movie_ranking_service import movie_ranking_service
from app.services.movie_service import movie_service


async def get_rankings(limit: int) -> MovieRankingResponse:
    return await movie_ranking_service.get_rankings(limit)


async def discover(
    page: int,
    language: str,
    sort_by: str,
    genre_id: int | None,
    page_size: int,
) -> MovieListResponse:
    return await movie_service.discover_philippine_movies(
        page, language, sort_by, genre_id=genre_id, page_size=page_size
    )


async def search(query: str, page: int, language: str) -> MovieListResponse:
    return await movie_service.search_movies(query.strip(), page, language)


async def get_movie(movie_id: int, language: str, region: str) -> MovieDetailResponse:
    return await movie_service.get_movie(movie_id, language, region.upper())
