export interface MovieReview {
  id: string
  author: string
  rating: number
  title: string
  content: string
  reviewed_at: string
  helpful_count: number
}

const heneralLunaReviews: MovieReview[] = [
  {
    id: 'hl-01', author: 'Miguel Santos', rating: 10,
    title: 'A fierce and unforgettable portrait',
    content: 'A commanding lead performance gives the political conflict urgency and a painful human cost.',
    reviewed_at: '2026-06-18', helpful_count: 184,
  },
  {
    id: 'hl-02', author: 'Ana Villanueva', rating: 9,
    title: 'History made urgent',
    content: 'Sharp dialogue and restless filmmaking turn a familiar chapter into immediate, gripping drama.',
    reviewed_at: '2026-05-29', helpful_count: 142,
  },
  {
    id: 'hl-03', author: 'Carlo Reyes', rating: 9,
    title: 'Bold, funny, and tragic',
    content: 'Dark humor and anger work together without losing sight of the people behind the history.',
    reviewed_at: '2026-04-11', helpful_count: 119,
  },
  {
    id: 'hl-04', author: 'Bea Mendoza', rating: 8,
    title: 'A commanding production',
    content: 'The performances and production design give the story a convincing sense of scale.',
    reviewed_at: '2026-03-20', helpful_count: 96,
  },
  {
    id: 'hl-05', author: 'Paolo Garcia', rating: 8,
    title: 'Essential modern Filipino cinema',
    content: 'Accessible, memorable, and filled with questions that remain relevant today.',
    reviewed_at: '2026-02-08', helpful_count: 88,
  },
  {
    id: 'hl-06', author: 'Lara Cruz', rating: 7,
    title: 'Powerful but occasionally uneven',
    content: 'The best scenes are riveting, though several tonal shifts needed more room.',
    reviewed_at: '2026-01-17', helpful_count: 64,
  },
  {
    id: 'hl-07', author: 'Nico Ramos', rating: 7,
    title: 'Strong ideas, busy execution',
    content: 'Its themes land clearly, but the pace leaves some relationships underdeveloped.',
    reviewed_at: '2025-12-02', helpful_count: 57,
  },
  {
    id: 'hl-08', author: 'Ella Bautista', rating: 6,
    title: 'Impressive yet heavy-handed',
    content: 'The craft is strong even when the repeated message reduces dramatic subtlety.',
    reviewed_at: '2025-10-24', helpful_count: 43,
  },
  {
    id: 'hl-09', author: 'Marco Lim', rating: 5,
    title: 'More spectacle than intimacy',
    content: 'I admired the scale but struggled to connect beyond the major historical moments.',
    reviewed_at: '2025-09-16', helpful_count: 31,
  },
  {
    id: 'hl-10', author: 'Rina Flores', rating: 4,
    title: 'Energetic but not for me',
    content: 'The heightened style and constant intensity kept me at a distance.',
    reviewed_at: '2025-08-03', helpful_count: 22,
  },
]

const himalaReviews: MovieReview[] = [
  {
    id: 'himala-01', author: 'Teresa Navarro', rating: 10,
    title: 'A timeless examination of belief',
    content: 'A remarkable lead performance anchors a patient examination of faith and desperation.',
    reviewed_at: '2026-07-01', helpful_count: 207,
  },
  {
    id: 'himala-02', author: 'Luis de Vera', rating: 10,
    title: 'Every frame carries meaning',
    content: 'The stark landscape and restrained direction remain haunting after the final scene.',
    reviewed_at: '2026-05-22', helpful_count: 176,
  },
  {
    id: 'himala-03', author: 'Maya Castillo', rating: 9,
    title: 'Quietly devastating',
    content: 'A deeply humane film that refuses easy answers and respects its characters.',
    reviewed_at: '2026-04-04', helpful_count: 153,
  },
  {
    id: 'himala-04', author: 'Anton Mercado', rating: 9,
    title: 'A landmark performance',
    content: 'Controlled, magnetic acting supported by images that make Cupang feel mythic.',
    reviewed_at: '2026-02-27', helpful_count: 128,
  },
  {
    id: 'himala-05', author: 'Sofia Aquino', rating: 9,
    title: 'Still urgent decades later',
    content: 'Its questions about truth and collective belief remain incredibly sharp.',
    reviewed_at: '2026-01-09', helpful_count: 111,
  },
  {
    id: 'himala-06', author: 'Gabriel Ong', rating: 7,
    title: 'Important but deliberately slow',
    content: 'I respected the ideas, though the measured middle was difficult to engage with.',
    reviewed_at: '2025-12-14', helpful_count: 72,
  },
  {
    id: 'himala-07', author: 'Ina Salazar', rating: 7,
    title: 'Beautifully made, emotionally distant',
    content: 'The imagery is unforgettable, but the approach kept me from several characters.',
    reviewed_at: '2025-11-05', helpful_count: 61,
  },
  {
    id: 'himala-08', author: 'Victor Tan', rating: 6,
    title: 'A demanding viewing experience',
    content: 'There is much to admire even if the austere style will not work for everyone.',
    reviewed_at: '2025-09-28', helpful_count: 48,
  },
  {
    id: 'himala-09', author: 'Claire Domingo', rating: 5,
    title: 'Themes stronger than the story',
    content: 'I appreciated the ideas, but the repetition limited the emotional impact.',
    reviewed_at: '2025-08-19', helpful_count: 35,
  },
  {
    id: 'himala-10', author: 'Daniel Co', rating: 4,
    title: 'Respectful, but not fully engaged',
    content: 'Strong performances could not overcome the slow rhythm for me.',
    reviewed_at: '2025-07-07', helpful_count: 25,
  },
]

export const movieReviewsByTmdbId: Record<number, MovieReview[]> = {
  359105: heneralLunaReviews,
  197976: himalaReviews,
}

export function getMovieReviews(movieId: number) {
  return movieReviewsByTmdbId[movieId] ?? []
}
