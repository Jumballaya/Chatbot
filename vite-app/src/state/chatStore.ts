import { create } from "zustand";
import { initiatePrompt } from "../api/prompt";

export type ChatRole = "user" | "assistant" | "system";
export type ChatStatus = "complete" | "streaming" | "error";

export type ChatEntry = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  status?: ChatStatus;
};

export interface ChatState {
  responses: ChatEntry[];
  loading: boolean;
  systemPrompt: string;
  error?: string;

  addEntry: (entry: Omit<ChatEntry, "timestamp">) => void;
  updateEntry: (id: string, patch: Partial<ChatEntry>) => void;

  setSystemPrompt: (systemPrompt: string) => void;
  fetchResponse: (prompt: string) => Promise<void>;
}

const STORAGE_KEY = "chat-history";

export const useChatStore = create<ChatState>((set, get) => ({
  responses: JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"),
  loading: false,
  error: undefined,

  systemPrompt:
    "You are a friendly assistant who speaks like a tech-savvy tutor.",

  setSystemPrompt: (systemPrompt) => set({ systemPrompt }),

  addEntry: (entry: Omit<ChatEntry, "timestamp">) => {
    const newEntry = {
      ...entry,
      timestamp: Date.now(),
      id: entry.id.length > 0 ? entry.id : crypto.randomUUID(),
    };
    const updated = [...get().responses, newEntry];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ responses: updated });
  },

  updateEntry: (id: string, patch: Partial<ChatEntry>) => {
    const updated = get().responses.map((m) =>
      m.id === id ? { ...m, ...patch } : m
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ responses: updated });
  },

  fetchResponse: async (prompt: string) => {
    set({ error: undefined, loading: true });

    const state = get();
    state.addEntry({
      role: "user",
      content: prompt,
      id: "",
    });

    const assistantId = crypto.randomUUID();
    state.addEntry({
      role: "assistant",
      content: "",
      id: assistantId,
      status: "streaming",
    });

    try {
      const system = get().systemPrompt;
      const messages: Array<{ role: ChatRole; content: string }> = [
        { role: "system", content: system },
        ...get().responses.map(({ role, content }) => ({ role, content })),
      ];
      let final = "";
      for await (const partial of initiatePrompt(messages)) {
        final = partial;
        state.updateEntry(assistantId, {
          content: partial,
          status: "streaming",
        });
      }

      state.updateEntry(assistantId, {
        content: final,
        status: "complete",
      });

      set({ loading: false });
    } catch (err) {
      get().updateEntry(assistantId, { status: "error" });
      set({ error: (err as Error).message, loading: false });
    }
  },
}));
