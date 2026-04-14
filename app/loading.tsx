export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/75 backdrop-blur-sm">
      <div className="flex items-end gap-1.5" aria-label="Loading" role="status">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="block w-[5px] rounded-sm bg-primary"
            style={{
              height: 10,
              animation: "nav-bar 900ms ease-in-out infinite",
              animationDelay: `${i * 130}ms`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes nav-bar {
          0%, 100% { height: 10px; opacity: 0.35; }
          50%       { height: 36px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
