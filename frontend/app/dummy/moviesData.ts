export interface Movie {
  id: string
  title: string
  year: string
  duration: string
  director: string
  genre: string
  rating: string
  description: string
  posterColor: string
  accentGlow: string
}

export const moviesData: Movie[] = [
  {
    id: 'himala',
    title: 'Himala',
    year: '1982',
    duration: '2h 04m',
    director: 'Ishmael Bernal',
    genre: 'Drama',
    rating: '8.0',
    description:
      'A young woman in a remote village claims to have seen the Virgin Mary and begins performing miraculous healings, altering the community forever.',
    posterColor: 'from-rose-950 via-rose-900 to-amber-950',
    accentGlow: 'group-hover:shadow-rose-900/40',
  },
  {
    id: 'oro-plata-mata',
    title: 'Oro, Plata, Mata',
    year: '1982',
    duration: '3h 14m',
    director: 'Peque Gallaga',
    genre: 'War',
    rating: '7.7',
    description:
      'Two wealthy landed families in Negros struggle to preserve their opulent lifestyle and sanity as WWII devastates the country around them.',
    posterColor: 'from-emerald-950 via-teal-950 to-stone-900',
    accentGlow: 'group-hover:shadow-emerald-900/40',
  },
  {
    id: 'maynila',
    title: 'Maynila sa mga Kuko ng Liwanag',
    year: '1975',
    duration: '2h 16m',
    director: 'Lino Brocka',
    genre: 'Crime',
    rating: '8.1',
    description:
      'A provincial fisherman arrives in Manila searching for his missing girlfriend, plunging into the dark realities of urban exploitation.',
    posterColor: 'from-amber-950 via-slate-900 to-indigo-950',
    accentGlow: 'group-hover:shadow-amber-900/40',
  },
  {
    id: 'otj',
    title: 'On the Job',
    year: '2013',
    duration: '2h 01m',
    director: 'Erik Matti',
    genre: 'Thriller',
    rating: '7.0',
    description:
      'Inmates are temporarily released from prison to execute high-profile political assassinations for corrupt government officials.',
    posterColor: 'from-red-950 via-zinc-900 to-black',
    accentGlow: 'group-hover:shadow-red-900/40',
  },
  {
    id: 'goyo',
    title: 'Goyo: Ang Batang Heneral',
    year: '2018',
    duration: '2h 30m',
    director: 'Jerrold Tarog',
    genre: 'Historical',
    rating: '7.5',
    description:
      'The story of Gregorio "Goyo" del Pilar, one of the youngest generals during the Philippine-American War, leading up to the historic Battle of Tirad Pass.',
    posterColor: 'from-blue-950 via-slate-900 to-amber-950',
    accentGlow: 'group-hover:shadow-blue-900/40',
  },
  {
    id: 'heneral-luna',
    title: 'Heneral Luna',
    year: '2015',
    duration: '1h 58m',
    director: 'Jerrold Tarog',
    genre: 'Historical',
    rating: '7.9',
    description:
      'General Antonio Luna leads the Philippine Revolutionary Army against American forces, fighting both foreign invaders and treacherous internal politics.',
    posterColor: 'from-red-950 via-amber-950 to-stone-900',
    accentGlow: 'group-hover:shadow-red-900/40',
  },
  {
    id: 'kita-kita',
    title: 'Kita Kita',
    year: '2017',
    duration: '1h 24m',
    director: 'Sigrid Andrea Bernardo',
    genre: 'Romance',
    rating: '7.6',
    description:
      'A tour guide in Sapporo, Japan suffers temporary blindness and forms a touching, unique friendship with a charming Filipino neighbor.',
    posterColor: 'from-fuchsia-950 via-pink-950 to-zinc-900',
    accentGlow: 'group-hover:shadow-fuchsia-900/40',
  },
  {
    id: 'four-sisters',
    title: 'Four Sisters and a Wedding',
    year: '2013',
    duration: '2h 05m',
    director: 'Cathy Garcia-Molina',
    genre: 'Comedy',
    rating: '7.3',
    description:
      'Four sisters reunite to try to stop their younger brother’s upcoming wedding, confronting long-hidden family tensions and secrets.',
    posterColor: 'from-purple-950 via-violet-950 to-slate-900',
    accentGlow: 'group-hover:shadow-purple-900/40',
  },
  {
    id: 'magnifico',
    title: 'Magnifico',
    year: '2003',
    duration: '2h 00m',
    director: 'Maryo J. de los Reyes',
    genre: 'Drama',
    rating: '8.0',
    description:
      'A kind-hearted young boy in a poor rural village attempts to help his struggling family through selfless devotion and unexpected grace.',
    posterColor: 'from-yellow-950 via-amber-900 to-zinc-950',
    accentGlow: 'group-hover:shadow-yellow-900/40',
  },
  {
    id: 'dekada-70',
    title: 'Dekada \'70',
    year: '2002',
    duration: '2h 16m',
    director: 'Chito S. Roño',
    genre: 'Drama',
    rating: '7.8',
    description:
      'A middle-class mother navigates family dynamics and political awakening during martial law in 1970s Philippines.',
    posterColor: 'from-stone-900 via-neutral-900 to-red-950',
    accentGlow: 'group-hover:shadow-red-900/40',
  },
  {
    id: 'buybust',
    title: 'BuyBust',
    year: '2018',
    duration: '2h 07m',
    director: 'Erik Matti',
    genre: 'Action',
    rating: '6.8',
    description:
      'An anti-narcotics squad becomes trapped in a labyrinthine Manila slum during a botched drug raid and must fight their way out.',
    posterColor: 'from-cyan-950 via-slate-900 to-black',
    accentGlow: 'group-hover:shadow-cyan-900/40',
  },
  {
    id: 'one-more-chance',
    title: 'One More Chance',
    year: '2007',
    duration: '1h 55m',
    director: 'Cathy Garcia-Molina',
    genre: 'Romance',
    rating: '7.7',
    description:
      'College sweethearts Popoy and Basha navigate heartbreak, personal growth, and second chances after a long-term relationship ends.',
    posterColor: 'from-rose-950 via-pink-900 to-amber-950',
    accentGlow: 'group-hover:shadow-rose-900/40',
  },
  {
    id: 'bar-boys',
    title: 'Bar Boys',
    year: '2017',
    duration: '1h 58m',
    director: 'Kip Oebanda',
    genre: 'Drama',
    rating: '7.9',
    description:
      'Four close friends enter law school together, facing rigorous academics, personal sacrifices, and tests of brotherhood.',
    posterColor: 'from-indigo-950 via-blue-950 to-zinc-900',
    accentGlow: 'group-hover:shadow-indigo-900/40',
  },
  {
    id: 'fan-girl',
    title: 'Fan Girl',
    year: '2020',
    duration: '1h 40m',
    director: 'Antoinette Jadaone',
    genre: 'Drama',
    rating: '7.2',
    description:
      'An obsessed teenage fan stows away in the pickup truck of her celebrity idol, leading to an eye-opening and harrowing night.',
    posterColor: 'from-violet-950 via-purple-950 to-rose-950',
    accentGlow: 'group-hover:shadow-violet-900/40',
  },
  {
    id: 'birdshot',
    title: 'Birdshot',
    year: '2016',
    duration: '1h 56m',
    director: 'Mikhail Red',
    genre: 'Mystery',
    rating: '7.3',
    description:
      'A young farm girl accidentally shoots an endangered Philippine Eagle, triggering a police investigation that uncovers deeper corruption.',
    posterColor: 'from-teal-950 via-emerald-950 to-black',
    accentGlow: 'group-hover:shadow-teal-900/40',
  },
  {
    id: 'seven-sundays',
    title: 'Seven Sundays',
    year: '2017',
    duration: '2h 08m',
    director: 'Cathy Garcia-Molina',
    genre: 'Family',
    rating: '7.8',
    description:
      'Four estranged siblings agree to spend their father’s final Sundays together after he is diagnosed with a terminal illness.',
    posterColor: 'from-amber-950 via-orange-950 to-stone-900',
    accentGlow: 'group-hover:shadow-amber-900/40',
  },
  {
    id: 'crying-ladies',
    title: 'Crying Ladies',
    year: '2003',
    duration: '1h 50m',
    director: 'Mark Meily',
    genre: 'Comedy',
    rating: '7.1',
    description:
      'Three women in Manila are hired as professional mourners for a wealthy Chinese-Filipino funeral, discovering unexpected humor and hope.',
    posterColor: 'from-sky-950 via-blue-950 to-slate-900',
    accentGlow: 'group-hover:shadow-sky-900/40',
  },
  {
    id: 'tadhana',
    title: 'That Thing Called Tadhana',
    year: '2014',
    duration: '1h 51m',
    director: 'Antoinette Jadaone',
    genre: 'Romance',
    rating: '7.6',
    description:
      'Two strangers meet at an airport in Rome and embark on a spontaneous road trip to Sagada to heal a broken heart.',
    posterColor: 'from-pink-950 via-rose-950 to-zinc-900',
    accentGlow: 'group-hover:shadow-pink-900/40',
  },
]
