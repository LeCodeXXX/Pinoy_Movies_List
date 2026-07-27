"""Application exceptions that can be rendered as HTTP error responses."""


class ApplicationError(Exception):
    """Base error containing the public HTTP response information."""

    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


class TmdbConfigurationError(ApplicationError):
    def __init__(self) -> None:
        super().__init__(503, "TMDB access token is not configured")


class MovieNotFoundError(ApplicationError):
    def __init__(self, movie_id: int) -> None:
        super().__init__(404, f"Movie {movie_id} was not found")


class TmdbAuthenticationError(ApplicationError):
    def __init__(self) -> None:
        super().__init__(502, "TMDB rejected the configured credentials")


class TmdbUnavailableError(ApplicationError):
    def __init__(self, detail: str = "TMDB is temporarily unavailable") -> None:
        super().__init__(502, detail)
