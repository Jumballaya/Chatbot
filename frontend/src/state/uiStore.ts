import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppMode = "graph-editor" | "agent-chat" | "file-editor";
export type UIState = {
  mode: AppMode;
  title: string;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;

  setMode(mode: AppMode): void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      mode: "agent-chat",
      title: "Chat",
      darkMode: true,

      setMode: (mode) => {
        let title = get().title;
        switch (mode) {
          case "agent-chat": {
            title = "Chatbot";
            break;
          }
          case "file-editor": {
            title = "File Editor";
            break;
          }
          case "graph-editor": {
            title = "Graph Editor";
          }
        }
        set({ mode, title });
      },

      setDarkMode: (darkMode: boolean) => {
        set({ darkMode });
      },
    }),
    { name: "ui-storage" }
  )
);
