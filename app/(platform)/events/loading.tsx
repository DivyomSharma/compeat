export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="h-6 w-32 rounded-sm bg-muted" />
          <div className="h-10 w-96 rounded-sm bg-muted" />
          <div className="h-4 w-72 rounded-sm bg-muted" />
        </div>
      </section>
      <div className="neo-card h-14" />
      <div className="neo-card h-20" />
      <section className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="neo-card h-52 p-5" />
        ))}
      </section>
    </div>
  );
}
