"""Normalized movie responses exposed by the application API."""

from datetime import date

from pydantic import BaseModel, Field


class GenreResponse(BaseModel):
    id: int
    name: str


class CastMemberResponse(BaseModel):
    id: int
    name: str
    character: str | None = None
    profile_url: str | None = None


class CrewMemberResponse(BaseModel):
    id: int
    name: str
    job: str
    profile_url: str | None = None


class TrailerResponse(BaseModel):
    name: str
    youtube_key: str
    url: str


class ProductionCompanyResponse(BaseModel):
    id: int
    name: str
    logo_url: str | None = None
    origin_country: str | None = None


class SpokenLanguageResponse(BaseModel):
    code: str
    name: str


class WatchProviderResponse(BaseModel):
    id: int
    name: str
    logo_url: str | None = None


class StreamingAvailabilityResponse(BaseModel):
    link: str | None = None
    streaming: list[WatchProviderResponse] = Field(default_factory=list)
    free: list[WatchProviderResponse] = Field(default_factory=list)
    ads: list[WatchProviderResponse] = Field(default_factory=list)
    rent: list[WatchProviderResponse] = Field(default_factory=list)
    buy: list[WatchProviderResponse] = Field(default_factory=list)
    attribution: str = "Availability data provided by JustWatch"


class MovieSummaryResponse(BaseModel):
    id: int
    title: str
    original_title: str
    original_language: str
    poster_url: str | None = None
    backdrop_url: str | None = None
    synopsis: str
    release_date: date | None = None
    genre_ids: list[int] = Field(default_factory=list)
    popularity: float = 0
    tmdb_vote_average: float = 0
    tmdb_vote_count: int = 0


class MovieListResponse(BaseModel):
    page: int
    total_pages: int
    total_results: int
    results: list[MovieSummaryResponse]


class MovieDetailResponse(BaseModel):
    id: int
    title: str
    original_title: str
    original_language: str
    poster_url: str | None = None
    backdrop_url: str | None = None
    synopsis: str
    tagline: str | None = None
    release_date: date | None = None
    runtime: int | None = None
    status: str | None = None
    genres: list[GenreResponse] = Field(default_factory=list)
    cast: list[CastMemberResponse] = Field(default_factory=list)
    director: CrewMemberResponse | None = None
    writers: list[CrewMemberResponse] = Field(default_factory=list)
    trailer: TrailerResponse | None = None
    production_companies: list[ProductionCompanyResponse] = Field(default_factory=list)
    spoken_languages: list[SpokenLanguageResponse] = Field(default_factory=list)
    budget: int = 0
    revenue: int = 0
    homepage: str | None = None
    imdb_id: str | None = None
    popularity: float = 0
    tmdb_vote_average: float = 0
    tmdb_vote_count: int = 0
    streaming_availability: StreamingAvailabilityResponse
    similar_movies: list[MovieSummaryResponse] = Field(default_factory=list)
