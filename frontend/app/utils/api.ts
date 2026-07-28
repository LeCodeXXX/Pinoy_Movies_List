const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

//Custome fetch function to make API calls
const api = (
  endpoint: string,
  method: string = 'GET',
  options: RequestInit = {},
) => {
  const url = `${API_BASE_URL}${endpoint}`
  return fetch(url, { method, ...options })
}

export default api
