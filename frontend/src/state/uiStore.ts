import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppMode = "graph-editor" | "agent-chat" | "file-editor";
type UIState = {
  mode: AppMode;
  title: string;

  setMode(mode: AppMode): void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      mode: "agent-chat",
      title: "Chat",
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
    }),
    { name: "ui-storage" }
  )
);
