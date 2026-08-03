"""Controllers for authentication and profile operations."""

from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UpdateProfileRequest,
    UserResponse,
)
from app.services.auth_service import auth_service
from app.middleware.jwt_auth import create_access_token


def build_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
        display_name=user.display_name,
        profile_picture=user.profile_picture,
        created_at=user.created_at,
        is_verified=user.is_verified,
        is_active=user.is_active,
    )


def build_auth_response(message: str, user: User) -> AuthResponse:
    return AuthResponse(
        message=message,
        user=build_user_response(user),
        access_token=create_access_token(str(user.id)),
    )


async def signup(data: SignupRequest) -> AuthResponse:
    user = await auth_service.signup(data)
    return build_auth_response("Account created successfully", user)


async def login(data: LoginRequest) -> AuthResponse:
    user = await auth_service.login(data)
    return build_auth_response("Login successful", user)


async def update_profile(user_id: str, data: UpdateProfileRequest) -> AuthResponse:
    user = await auth_service.update_profile(
        user_id=user_id,
        display_name=data.display_name,
        profile_picture=data.profile_picture,
    )
    return build_auth_response("Profile updated successfully", user)
