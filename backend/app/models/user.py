"""Database document for application users."""

from datetime import datetime, timezone

from beanie import Document, Indexed
from pydantic import EmailStr, Field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Document):
    username: Indexed(str, unique=True)
    email: Indexed(EmailStr, unique=True)
    password_hash: str
    display_name: str
    profile_picture: str | None = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    is_verified: bool = False
    is_active: bool = True

    class Settings:
        name = "users"
