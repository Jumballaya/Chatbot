import { create } from "zustand";
import { sendPrompt } from "../api/prompt";

export type ChatEntry = {
  timestamp: number;
  entry: string;
  isUser: boolean;
};

export interface ChatState {
  responses: ChatEntry[];
  loading: boolean;
  error?: string;

  addResponse: (entry: string, isUser: boolean) => void;
  clearResponses: () => void;
  fetchResponse: (prompt: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
  responses: [],
  loading: false,
  error: undefined,

  addResponse: (entry, isUser) =>
    set((s) => ({
      responses: [...s.responses, { entry, timestamp: Date.now(), isUser }],
    })),

  clearResponses: () => set({ responses: [] }),

  fetchResponse: async (prompt: string) => {
    set({ loading: true, error: undefined });

    try {
      const res = await sendPrompt(prompt);
      set((s) => ({
        responses: [
          ...s.responses,
          {
            entry: res.response.trim(),
            timestamp: Date.now(),
            isUser: false,
          },
        ],
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
}));
