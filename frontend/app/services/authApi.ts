import type {
  AuthResponse,
  LoginInput,
  SignupInput,
  UpdateProfileInput,
} from '../types/auth'
import api from '../utils/api'

async function sendAuthRequest(
  endpoint: string,
  method: 'POST' | 'PUT',
  input: LoginInput | SignupInput | UpdateProfileInput,
) {
  const response = await api(endpoint, method, {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { detail?: string | Array<{ msg?: string }> }
      | null
    const detail = body?.detail
    const message = Array.isArray(detail)
      ? detail[0]?.msg
      : detail

    throw new Error(message ?? `Request failed (${response.status})`)
  }

  return (await response.json()) as AuthResponse
}

export function login(input: LoginInput) {
  return sendAuthRequest('/api/auth/login', 'POST', input)
}

export function signup(input: SignupInput) {
  return sendAuthRequest('/api/auth/signup', 'POST', input)
}

export function updateProfile(userId: string, input: UpdateProfileInput) {
  return sendAuthRequest(`/api/auth/profile/${userId}`, 'PUT', input)
}

