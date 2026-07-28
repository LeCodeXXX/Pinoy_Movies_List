export interface MovieCastMember {
  id: string
  name: string
  character: string
}

export interface MovieAvailability {
  status: 'available' | 'unavailable'
  quality: string
  subtitles: string[]
}

export interface MovieRatingBucket {
  score: number
  count: number
  percentage: number
}

export interface MovieReview {
  id: string
  author: string
  rating: number
  title: string
  content: string
  reviewed_at: string
  helpful_count: number
}

export interface MovieDetails {
  id: string
  title: string
  tagline: string
  overview: string
  release_date: string
  release_year: number
  runtime_minutes: number
  genres: string[]
  rating: number
  vote_count: number
  popularity: number
  content_rating: string
  original_language: string
  country: string
  director: string
  writers: string[]
  cast: MovieCastMember[]
  production_companies: string[]
  availability: MovieAvailability
  rating_distribution: MovieRatingBucket[]
  reviews: MovieReview[]
  poster_color: string
  backdrop_color: string
}

export interface MovieDetailsApiResponse {
  success: boolean
  message: string
  data: MovieDetails
}

export const movieDetailsApiResponses: Record<
  string,
  MovieDetailsApiResponse
> = {
  'heneral-luna': {
    success: true,
    message: 'Movie details retrieved successfully.',
    data: {
      id: 'heneral-luna',
      title: 'Heneral Luna',
      tagline: 'Bayan o sarili?',
      overview:
        'General Antonio Luna leads the Philippine Revolutionary Army against American forces while confronting political division, betrayal, and the difficult cost of building a nation.',
      release_date: '2015-09-09',
      release_year: 2015,
      runtime_minutes: 118,
      genres: ['Historical', 'Drama', 'War'],
      rating: 7.9,
      vote_count: 6842,
      popularity: 96.4,
      content_rating: 'R-13',
      original_language: 'Filipino',
      country: 'Philippines',
      director: 'Jerrold Tarog',
      writers: ['Henry Francia', 'E.A. Rocha', 'Jerrold Tarog'],
      cast: [
        {
          id: 'john-arcilla',
          name: 'John Arcilla',
          character: 'Antonio Luna',
        },
        {
          id: 'mon-confiado',
          name: 'Mon Confiado',
          character: 'Emilio Aguinaldo',
        },
        {
          id: 'arron-villaflor',
          name: 'Arron Villaflor',
          character: 'Joven Hernando',
        },
        {
          id: 'joem-bascon',
          name: 'Joem Bascon',
          character: 'Paco Roman',
        },
      ],
      production_companies: ['Artikulo Uno Productions'],
      availability: {
        status: 'available',
        quality: 'HD',
        subtitles: ['English', 'Filipino'],
      },
      rating_distribution: [
        { score: 10, count: 1026, percentage: 15 },
        { score: 9, count: 1368, percentage: 20 },
        { score: 8, count: 1711, percentage: 25 },
        { score: 7, count: 1163, percentage: 17 },
        { score: 6, count: 684, percentage: 10 },
        { score: 5, count: 411, percentage: 6 },
        { score: 4, count: 205, percentage: 3 },
        { score: 3, count: 137, percentage: 2 },
        { score: 2, count: 68, percentage: 1 },
        { score: 1, count: 69, percentage: 1 },
      ],
      reviews: [
        {
          id: 'hl-review-01',
          author: 'Miguel Santos',
          rating: 10,
          title: 'A fierce and unforgettable portrait',
          content:
            'John Arcilla gives the film enormous energy, while the political conflicts make every victory feel painfully fragile.',
          reviewed_at: '2026-06-18',
          helpful_count: 184,
        },
        {
          id: 'hl-review-02',
          author: 'Ana Villanueva',
          rating: 9,
          title: 'History made urgent',
          content:
            'The sharp dialogue and restless camera work turn a familiar historical chapter into a tense and immediate drama.',
          reviewed_at: '2026-05-29',
          helpful_count: 142,
        },
        {
          id: 'hl-review-03',
          author: 'Carlo Reyes',
          rating: 9,
          title: 'Bold, funny, and tragic',
          content:
            'It balances dark humor with real anger and never loses sight of the human cost behind political ambition.',
          reviewed_at: '2026-04-11',
          helpful_count: 119,
        },
        {
          id: 'hl-review-04',
          author: 'Bea Mendoza',
          rating: 8,
          title: 'A commanding lead performance',
          content:
            'The central performance is excellent and the production design gives the story a convincing sense of scale.',
          reviewed_at: '2026-03-20',
          helpful_count: 96,
        },
        {
          id: 'hl-review-05',
          author: 'Paolo Garcia',
          rating: 8,
          title: 'Essential modern Filipino cinema',
          content:
            'An accessible historical film with memorable characters, strong momentum, and questions that still feel relevant.',
          reviewed_at: '2026-02-08',
          helpful_count: 88,
        },
        {
          id: 'hl-review-06',
          author: 'Lara Cruz',
          rating: 7,
          title: 'Powerful but occasionally uneven',
          content:
            'The best scenes are riveting, though a few tonal shifts and supporting storylines could have used more room.',
          reviewed_at: '2026-01-17',
          helpful_count: 64,
        },
        {
          id: 'hl-review-07',
          author: 'Nico Ramos',
          rating: 7,
          title: 'Strong ideas, busy execution',
          content:
            'Its themes land clearly, but the rapid pace sometimes makes important relationships feel underdeveloped.',
          reviewed_at: '2025-12-02',
          helpful_count: 57,
        },
        {
          id: 'hl-review-08',
          author: 'Ella Bautista',
          rating: 6,
          title: 'Impressive yet heavy-handed',
          content:
            'The craft is consistently strong, although the message is repeated often enough to reduce some dramatic subtlety.',
          reviewed_at: '2025-10-24',
          helpful_count: 43,
        },
        {
          id: 'hl-review-09',
          author: 'Marco Lim',
          rating: 5,
          title: 'More spectacle than intimacy',
          content:
            'I admired the scale and performances but struggled to connect with the film beyond its major historical moments.',
          reviewed_at: '2025-09-16',
          helpful_count: 31,
        },
        {
          id: 'hl-review-10',
          author: 'Rina Flores',
          rating: 4,
          title: 'Energetic but not for me',
          content:
            'The heightened style and constant intensity kept me at a distance despite the importance of the subject.',
          reviewed_at: '2025-08-03',
          helpful_count: 22,
        },
      ],
      poster_color: 'from-red-950 via-amber-950 to-stone-950',
      backdrop_color: 'from-red-950/80 via-zinc-950 to-zinc-950',
    },
  },
  himala: {
    success: true,
    message: 'Movie details retrieved successfully.',
    data: {
      id: 'himala',
      title: 'Himala',
      tagline: 'Walang himala.',
      overview:
        'A young woman in the drought-stricken village of Cupang says she has seen the Virgin Mary. As people arrive seeking healing, faith and desperation transform the community around her.',
      release_date: '1982-12-25',
      release_year: 1982,
      runtime_minutes: 124,
      genres: ['Drama', 'Mystery'],
      rating: 8.0,
      vote_count: 4287,
      popularity: 91.8,
      content_rating: 'PG',
      original_language: 'Filipino',
      country: 'Philippines',
      director: 'Ishmael Bernal',
      writers: ['Ricardo Lee'],
      cast: [
        {
          id: 'nora-aunor',
          name: 'Nora Aunor',
          character: 'Elsa',
        },
        {
          id: 'spanky-manikan',
          name: 'Spanky Manikan',
          character: 'Orly',
        },
        {
          id: 'gigi-duenas',
          name: 'Gigi Dueñas',
          character: 'Nimia',
        },
        {
          id: 'laura-centeno',
          name: 'Laura Centeno',
          character: 'Chayong',
        },
      ],
      production_companies: ['Experimental Cinema of the Philippines'],
      availability: {
        status: 'available',
        quality: 'Restored HD',
        subtitles: ['English'],
      },
      rating_distribution: [
        { score: 10, count: 857, percentage: 20 },
        { score: 9, count: 943, percentage: 22 },
        { score: 8, count: 1072, percentage: 25 },
        { score: 7, count: 600, percentage: 14 },
        { score: 6, count: 343, percentage: 8 },
        { score: 5, count: 214, percentage: 5 },
        { score: 4, count: 86, percentage: 2 },
        { score: 3, count: 86, percentage: 2 },
        { score: 2, count: 43, percentage: 1 },
        { score: 1, count: 43, percentage: 1 },
      ],
      reviews: [
        {
          id: 'himala-review-01',
          author: 'Teresa Navarro',
          rating: 10,
          title: 'A timeless examination of belief',
          content:
            'Nora Aunor is extraordinary, and the film observes faith, poverty, and spectacle with remarkable patience and clarity.',
          reviewed_at: '2026-07-01',
          helpful_count: 207,
        },
        {
          id: 'himala-review-02',
          author: 'Luis de Vera',
          rating: 10,
          title: 'Every frame carries meaning',
          content:
            'The stark landscape and restrained direction create an atmosphere that remains haunting long after the final scene.',
          reviewed_at: '2026-05-22',
          helpful_count: 176,
        },
        {
          id: 'himala-review-03',
          author: 'Maya Castillo',
          rating: 9,
          title: 'Quietly devastating',
          content:
            'A deeply humane film that refuses easy answers and allows every character to reveal a different kind of need.',
          reviewed_at: '2026-04-04',
          helpful_count: 153,
        },
        {
          id: 'himala-review-04',
          author: 'Anton Mercado',
          rating: 9,
          title: 'A landmark performance',
          content:
            'The lead performance is controlled and magnetic, supported by images that make Cupang feel almost mythic.',
          reviewed_at: '2026-02-27',
          helpful_count: 128,
        },
        {
          id: 'himala-review-05',
          author: 'Sofia Aquino',
          rating: 9,
          title: 'Still urgent decades later',
          content:
            'Its questions about truth, desperation, and collective belief feel as sharp now as they must have on release.',
          reviewed_at: '2026-01-09',
          helpful_count: 111,
        },
        {
          id: 'himala-review-06',
          author: 'Gabriel Ong',
          rating: 7,
          title: 'Important but deliberately slow',
          content:
            'I respected its ideas and performances, though the measured pace made parts of the middle difficult to engage with.',
          reviewed_at: '2025-12-14',
          helpful_count: 72,
        },
        {
          id: 'himala-review-07',
          author: 'Ina Salazar',
          rating: 7,
          title: 'Beautifully made, emotionally distant',
          content:
            'The imagery is unforgettable, but the observational approach kept me from connecting closely with several characters.',
          reviewed_at: '2025-11-05',
          helpful_count: 61,
        },
        {
          id: 'himala-review-08',
          author: 'Victor Tan',
          rating: 6,
          title: 'A demanding viewing experience',
          content:
            'There is much to admire in the craft, even if the austere style and pacing will not work for every viewer.',
          reviewed_at: '2025-09-28',
          helpful_count: 48,
        },
        {
          id: 'himala-review-09',
          author: 'Claire Domingo',
          rating: 5,
          title: 'The themes worked better than the story',
          content:
            'I appreciated what the film was exploring, but its distance and repetition limited the emotional impact for me.',
          reviewed_at: '2025-08-19',
          helpful_count: 35,
        },
        {
          id: 'himala-review-10',
          author: 'Daniel Co',
          rating: 4,
          title: 'Respectful, but not fully engaged',
          content:
            'The performances are strong, yet the slow rhythm and bleak tone made it difficult for me to stay invested.',
          reviewed_at: '2025-07-07',
          helpful_count: 25,
        },
      ],
      poster_color: 'from-rose-950 via-rose-900 to-amber-950',
      backdrop_color: 'from-rose-950/80 via-amber-950/30 to-zinc-950',
    },
  },
}

export const movieDetailIds = Object.keys(movieDetailsApiResponses)
