"use client";

import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render icons after mount — avoids server/client mismatch
  // because the server has no knowledge of the user's preferred theme.
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      className="size-11"
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
    >
      {/* Render a fixed-size blank space on the server so layout doesn't shift */}
      {mounted ? (
        currentTheme === "dark" ? <SunMedium /> : <MoonStar />
      ) : (
        <span className="size-5" />
      )}
    </Button>
  );
}
