export interface AuthUser {
  banner_picture?: string | null
  id: string
  username: string
  email: string
  display_name: string
  profile_picture: string | null
  created_at: string
  is_verified: boolean
  is_active: boolean
}

export interface AuthResponse {
  message: string
  user: AuthUser
  access_token: string
  token_type: string
}

export interface LoginInput {
  identifier: string
  password: string
}

export interface SignupInput {
  username: string
  email: string
  password: string
  display_name: string
}

export interface UpdateProfileInput {
  display_name?: string
  profile_picture?: string | null
}
