import Image from 'next/image'

const TMDB_LOGO_URL =
  'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg'

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 px-4 py-8 text-zinc-400">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-400">
            Data credits
          </p>
          <p className="mt-2 max-w-3xl text-xs leading-6">
            Movie metadata and images are provided by The Movie Database
            (TMDB). Community scores and vote counts come only from ratings
            submitted by users of this app.
          </p>
          <p className="mt-1 max-w-3xl text-xs leading-6 text-zinc-500">
            This product uses the TMDB API but is not endorsed or certified by
            TMDB.
          </p>
        </div>
        <a
          aria-label="Visit The Movie Database"
          className="shrink-0 rounded-xl border border-zinc-800 bg-zinc-900/70 p-2.5 transition hover:border-red-500/40"
          href="https://www.themoviedb.org"
          rel="noreferrer"
          target="_blank"
        >
          <Image
            alt="The Movie Database (TMDB)"
            height={52}
            src={TMDB_LOGO_URL}
            width={72}
          />
        </a>
      </div>
    </footer>
  )
}
