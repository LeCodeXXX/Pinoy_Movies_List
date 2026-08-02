from typing import Annotated

from fastapi import APIRouter, Path, Query

from app.core.config import settings
from app.schemas.credit import CreditMoviesResponse
from app.controllers import credit_controller

router = APIRouter(tags=["credits"])


@router.get("/people/{person_id}", response_model=CreditMoviesResponse)
async def get_person_movies(
    person_id: Annotated[int, Path(ge=1)],
    page: Annotated[int, Query(ge=1, le=500)] = 1,
    page_size: Annotated[int, Query(ge=1, le=12)] = 12,
    language: Annotated[str, Query(min_length=2, max_length=10)] = settings.tmdb_default_language,
) -> CreditMoviesResponse:
    return await credit_controller.get_person_movies(person_id, page, page_size, language)


@router.get("/companies/{company_id}", response_model=CreditMoviesResponse)
async def get_company_movies(
    company_id: Annotated[int, Path(ge=1)],
    page: Annotated[int, Query(ge=1, le=500)] = 1,
    page_size: Annotated[int, Query(ge=1, le=12)] = 12,
    language: Annotated[str, Query(min_length=2, max_length=10)] = settings.tmdb_default_language,
) -> CreditMoviesResponse:
    return await credit_controller.get_company_movies(company_id, page, page_size, language)
