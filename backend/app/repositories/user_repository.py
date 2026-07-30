"""Database operations for users."""

from app.models.user import User


class UserRepository:
    async def find_by_username(self, username: str) -> User | None:
        return await User.find_one(User.username == username)

    async def find_by_email(self, email: str) -> User | None:
        return await User.find_one(User.email == email)

    async def find_by_identifier(self, identifier: str) -> User | None:
        return await User.find_one(
            {"$or": [{"username": identifier}, {"email": identifier}]}
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
        user = User(
            username=username,
            email=email,
            password_hash=password_hash,
            display_name=display_name,
            profile_picture=profile_picture,
        )
        await user.insert()
        return user

    async def find_by_id(self, user_id: str) -> User | None:
        return await User.get(user_id)

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
        await user.save()
        return user


user_repository = UserRepository()

