export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="h-6 w-24 rounded-sm bg-muted" />
          <div className="h-10 w-80 rounded-sm bg-muted" />
          <div className="h-4 w-64 rounded-sm bg-muted" />
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="neo-card h-48 p-5" />
        ))}
      </section>
    </div>
  );
}
