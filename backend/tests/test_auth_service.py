"""Tests for signup and login business rules."""

from unittest import IsolatedAsyncioTestCase

from app.core.exceptions import InvalidCredentialsError, UserAlreadyExistsError
from app.models.user import User
from app.schemas.auth import LoginRequest, SignupRequest
from app.services.auth_service import AuthService


class FakeUserRepository:
    def __init__(self) -> None:
        self.users: list[User] = []

    async def find_by_username(self, username: str) -> User | None:
        return next((user for user in self.users if user.username == username), None)

    async def find_by_email(self, email: str) -> User | None:
        return next((user for user in self.users if str(user.email) == email), None)

    async def find_by_identifier(self, identifier: str) -> User | None:
        return next(
            (
                user
                for user in self.users
                if user.username == identifier or str(user.email) == identifier
            ),
            None,
        )

    async def create(
        self,
        *,
        username: str,
        email: str,
        password_hash: str,
        display_name: str,
        profile_picture: str | None,
    ) -> User:
        user = User.model_construct(
            id="user-123",
            username=username,
            email=email,
            password_hash=password_hash,
            display_name=display_name,
            profile_picture=profile_picture,
            is_active=True,
        )
        self.users.append(user)
        return user

    async def find_by_id(self, user_id: str) -> User | None:
        return next((user for user in self.users if str(getattr(user, "id", "")) == user_id), None)

    async def update_profile(
        self,
        user: User,
        *,
        display_name: str | None = None,
        profile_picture: str | None = None,
    ) -> User:
        if display_name is not None:
            user.display_name = display_name
        if profile_picture is not None:
            user.profile_picture = profile_picture
        return user



class AuthServiceTests(IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        self.repository = FakeUserRepository()
        self.service = AuthService(self.repository)  # type: ignore[arg-type]
        self.signup_data = SignupRequest(
            username="MovieFan",
            email="fan@example.com",
            password="secure-password",
            display_name="Movie Fan",
        )

    async def test_signup_hashes_password_and_normalizes_credentials(self) -> None:
        user = await self.service.signup(self.signup_data)

        self.assertEqual(user.username, "moviefan")
        self.assertEqual(user.email, "fan@example.com")
        self.assertNotEqual(user.password_hash, self.signup_data.password)

    async def test_login_accepts_username_or_email(self) -> None:
        await self.service.signup(self.signup_data)

        by_username = await self.service.login(
            LoginRequest(identifier="MovieFan", password="secure-password")
        )
        by_email = await self.service.login(
            LoginRequest(identifier="FAN@EXAMPLE.COM", password="secure-password")
        )

        self.assertIs(by_username, by_email)

    async def test_signup_rejects_duplicate_username(self) -> None:
        await self.service.signup(self.signup_data)

        with self.assertRaises(UserAlreadyExistsError):
            await self.service.signup(
                self.signup_data.model_copy(update={"email": "other@example.com"})
            )

    async def test_login_rejects_invalid_credentials(self) -> None:
        await self.service.signup(self.signup_data)

        with self.assertRaises(InvalidCredentialsError):
            await self.service.login(
                LoginRequest(identifier="MovieFan", password="wrong-password")
            )

    async def test_update_profile_updates_display_name_and_picture(self) -> None:
        user = await self.service.signup(self.signup_data)

        updated = await self.service.update_profile(
            user_id="user-123",
            display_name="Updated Fan",
            profile_picture="https://example.com/pic.png",
        )

        self.assertEqual(updated.display_name, "Updated Fan")
        self.assertEqual(updated.profile_picture, "https://example.com/pic.png")

