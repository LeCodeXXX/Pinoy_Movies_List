import type { CreditMoviesResponse } from '../types/people'
import api from '../utils/api'

async function getCreditMovies(path: string, page: number, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(page), page_size: '12', language: 'en-US' })
  const response = await api(`${path}?${params}`, 'GET', { signal })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null
    throw new Error(body?.detail ?? `Request failed (${response.status})`)
  }
  return (await response.json()) as CreditMoviesResponse
}

export function getPersonMovies(personId: number, page: number, signal?: AbortSignal) {
  return getCreditMovies(`/api/people/${personId}`, page, signal)
}

export function getCompanyMovies(companyId: number, page: number, signal?: AbortSignal) {
  return getCreditMovies(`/api/companies/${companyId}`, page, signal)
}
