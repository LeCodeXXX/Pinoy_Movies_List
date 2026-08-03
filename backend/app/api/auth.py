"""Signup and login endpoints."""

from fastapi import APIRouter, Request, Response, status

from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UpdateProfileRequest,
)
from app.controllers import auth_controller
from app.middleware.jwt_auth import require_same_user
from app.middleware.rate_limiter import login_limit, write_limit

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@write_limit
async def signup(request: Request, response: Response, data: SignupRequest) -> AuthResponse:
    return await auth_controller.signup(data)


@router.post("/login", response_model=AuthResponse)
@login_limit
async def login(request: Request, response: Response, data: LoginRequest) -> AuthResponse:
    return await auth_controller.login(data)


@router.put("/profile/{user_id}", response_model=AuthResponse)
@write_limit
async def update_profile(
    request: Request,
    response: Response,
    user_id: str,
    data: UpdateProfileRequest,
) -> AuthResponse:
    require_same_user(user_id, request)
    return await auth_controller.update_profile(user_id, data)
