"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Shows a semi-transparent overlay with animated bars whenever
 * a route segment is loading or navigation is in flight.
 * Attached to pathname changes so it clears once the new page renders.
 */
export function NavigationLoader() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const prev = useRef(pathname);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (prev.current !== pathname) {
      // Navigation completed — give a tiny grace period then hide
      clearTimeout(hideTimer.current!);
      hideTimer.current = setTimeout(() => setShow(false), 250);
      prev.current = pathname;
    }
  }, [pathname]);

  // Listen for any anchor click to trigger show
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("#")) return;
      if (href === window.location.pathname) return;
      setShow(true);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/75 backdrop-blur-sm"
      style={{ animation: "fade-in 120ms ease-out forwards" }}
    >
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
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes nav-bar {
          0%, 100% { height: 10px; opacity: 0.35; }
          50%       { height: 36px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
