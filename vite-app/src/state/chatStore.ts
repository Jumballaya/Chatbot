import { create } from "zustand";
import { sendPrompt } from "../api/prompt";

export interface ChatState {
  responses: string[];
  loading: boolean;
  error?: string;

  addResponse: (markdown: string) => void;
  clearResponses: () => void;
  fetchResponse: (prompt: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
  responses: [],
  loading: false,
  error: undefined,

  addResponse: (markdown) =>
    set((s) => ({ responses: [...s.responses, markdown] })),

  clearResponses: () => set({ responses: [] }),

  fetchResponse: async (prompt: string) => {
    set({ loading: true, error: undefined });

    try {
      const res = await sendPrompt(prompt);
      set((s) => ({
        responses: [...s.responses, res.response.trim()],
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
}));
