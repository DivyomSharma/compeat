"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { NavigationLoader } from "@/components/layout/navigation-loader";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <NavigationLoader />
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          classNames: {
            toast:
              "rounded-md border-[3px] border-border bg-card text-card-foreground shadow-none",
          },
        }}
      />
    </ThemeProvider>
  );
}
