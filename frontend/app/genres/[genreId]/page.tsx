import { notFound } from 'next/navigation'
import { getMovieGenre } from '@/app/constants/movieGenres'
import GenreMovies from '@/app/pages/GenreMovies'

interface GenrePageProps {
  params: Promise<{ genreId: string }>
  searchParams: Promise<{ page?: string | string[] }>
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  const [{ genreId }, query] = await Promise.all([params, searchParams])
  const genre = getMovieGenre(Number(genreId))
  if (!genre) notFound()

  const requestedPage = Array.isArray(query.page) ? query.page[0] : query.page
  const parsedPage = Number(requestedPage ?? '1')
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1

  return <GenreMovies genre={genre} page={page} />
}
