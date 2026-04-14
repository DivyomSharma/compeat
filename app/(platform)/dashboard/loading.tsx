export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <section>
        <div className="h-6 w-32 rounded-sm bg-muted" />
        <div className="mt-4 h-10 w-2/3 rounded-sm bg-muted" />
        <div className="mt-3 h-4 w-1/2 rounded-sm bg-muted" />
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="neo-card h-24 p-5" />
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="h-8 w-40 rounded-sm bg-muted" />
          <div className="neo-card h-40" />
          <div className="neo-card h-40" />
        </div>
        <div className="space-y-4">
          <div className="h-8 w-40 rounded-sm bg-muted" />
          <div className="neo-card h-32" />
          <div className="neo-card h-32" />
        </div>
      </section>
    </div>
  );
}
