"""Signup and login endpoints."""

from fastapi import APIRouter, status

from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UpdateProfileRequest,
    UserResponse,
)
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["authentication"])


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


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(data: SignupRequest) -> AuthResponse:
    user = await auth_service.signup(data)
    return AuthResponse(message="Account created successfully", user=build_user_response(user))


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest) -> AuthResponse:
    user = await auth_service.login(data)
    return AuthResponse(message="Login successful", user=build_user_response(user))


@router.put("/profile/{user_id}", response_model=AuthResponse)
async def update_profile(user_id: str, data: UpdateProfileRequest) -> AuthResponse:
    user = await auth_service.update_profile(
        user_id=user_id,
        display_name=data.display_name,
        profile_picture=data.profile_picture,
    )
    return AuthResponse(message="Profile updated successfully", user=build_user_response(user))

