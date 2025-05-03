import { create } from "zustand";
import { sendPrompt } from "../api/prompt";

export type ChatRole = "user" | "assistant" | "system";

export type ChatEntry = {
  role: ChatRole;
  content: string;
};

export interface ChatState {
  responses: ChatEntry[];
  loading: boolean;
  systemPrompt: string;
  error?: string;

  addResponse: (content: string, role: ChatRole) => void;
  clearResponses: () => void;
  fetchResponse: (prompt: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  responses: [],
  loading: false,
  error: undefined,

  systemPrompt:
    "You are a friendly assistant who speaks like a tech-savvy tutor.",

  addResponse: (content, role) =>
    set((s) => ({
      responses: [...s.responses, { content, role }],
    })),

  clearResponses: () => set({ responses: [] }),

  fetchResponse: async (prompt: string) => {
    set((s) => ({
      loading: true,
      error: undefined,
      responses: [...s.responses, { content: prompt, role: "user" }],
    }));

    try {
      const state = get();
      const res = await sendPrompt([
        {
          role: "system",
          content: state.systemPrompt,
        },
        ...state.responses,
      ]);

      console.log(res);

      set((s) => ({
        responses: [
          ...s.responses,
          {
            content: res.message.content.trim(),
            role: res.message.role,
          },
        ],
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
}));
