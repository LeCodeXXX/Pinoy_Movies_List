"""User signup and credential authentication logic."""

import asyncio

from pymongo.errors import DuplicateKeyError

from app.core.exceptions import (
    InactiveUserError,
    InvalidCredentialsError,
    UserAlreadyExistsError,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository, user_repository
from app.schemas.auth import LoginRequest, SignupRequest
from app.utils.password import hash_password, verify_password


class AuthService:
    def __init__(self, repository: UserRepository = user_repository) -> None:
        self.repository = repository

    async def signup(self, data: SignupRequest) -> User:
        username = data.username.lower()
        email = str(data.email).lower()

        if await self.repository.find_by_username(username) is not None:
            raise UserAlreadyExistsError("username")
        if await self.repository.find_by_email(email) is not None:
            raise UserAlreadyExistsError("email")

        try:
            return await self.repository.create(
                username=username,
                email=email,
                password_hash=await asyncio.to_thread(hash_password, data.password),
                display_name=data.display_name,
                profile_picture=data.profile_picture,
            )
        except DuplicateKeyError as error:
            # A concurrent signup may pass the checks above before its insert wins.
            raise UserAlreadyExistsError("username or email") from error

    async def login(self, data: LoginRequest) -> User:
        user = await self.repository.find_by_identifier(data.identifier.lower())
        if user is None or not await asyncio.to_thread(
            verify_password,
            data.password,
            user.password_hash if user is not None else "",
        ):
            raise InvalidCredentialsError()
        if not user.is_active:
            raise InactiveUserError()
        return user

    async def update_profile(
        self,
        user_id: str,
        display_name: str | None = None,
        profile_picture: str | None = None,
    ) -> User:
        user = await self.repository.find_by_id(user_id)
        if user is None:
            raise InvalidCredentialsError()
        if not user.is_active:
            raise InactiveUserError()
        return await self.repository.update_profile(
            user,
            display_name=display_name,
            profile_picture=profile_picture,
        )


auth_service = AuthService()

