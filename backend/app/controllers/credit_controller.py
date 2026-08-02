"""Controllers for people and company credits."""

from app.schemas.credit import CreditMoviesResponse
from app.services.credit_service import credit_service


async def get_person_movies(
    person_id: int, page: int, page_size: int, language: str
) -> CreditMoviesResponse:
    return await credit_service.get_person(person_id, page, page_size, language)


async def get_company_movies(
    company_id: int, page: int, page_size: int, language: str
) -> CreditMoviesResponse:
    return await credit_service.get_company(company_id, page, page_size, language)
