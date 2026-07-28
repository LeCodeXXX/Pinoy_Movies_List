export default function GenrePageLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="h-10 w-40 animate-pulse rounded-xl bg-zinc-900" />
        <div className="mb-8 mt-10 h-16 w-80 max-w-full animate-pulse rounded-xl bg-zinc-900" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 24 }, (_, index) => (
            <div
              key={index}
              className="aspect-[2/3] animate-pulse rounded-xl bg-zinc-900"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
