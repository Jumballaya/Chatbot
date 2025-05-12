import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppMode = "graph-editor" | "agent-chat" | "file-editor";
type UIState = {
  mode: AppMode;
  setMode(mode: AppMode): void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      mode: "agent-chat",
      setMode: (mode) => set({ mode }),
    }),
    { name: "ui-storage" }
  )
);
