"use client";

import { create } from "zustand";

type EventFilterState = {
  category: string;
  city: string;
  scope: "all" | "my-school" | "network";
  setCategory: (category: string) => void;
  setCity: (city: string) => void;
  setScope: (scope: "all" | "my-school" | "network") => void;
  reset: () => void;
};

export const useEventFilterStore = create<EventFilterState>((set) => ({
  category: "all",
  city: "",
  scope: "all",
  setCategory: (category) => set({ category }),
  setCity: (city) => set({ city }),
  setScope: (scope) => set({ scope }),
  reset: () => set({ category: "all", city: "", scope: "all" }),
}));
