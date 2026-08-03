const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'
export const AUTH_TOKEN_STORAGE_KEY = 'pinoy-cinema-access-token'

//Custome fetch function to make API calls
const api = (
  endpoint: string,
  method: string = 'GET',
  options: RequestInit = {},
) => {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = new Headers(options.headers)
  const token =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
      : null

  if (token) headers.set('Authorization', `Bearer ${token}`)

  return fetch(url, { ...options, method, headers })
}

export default api
