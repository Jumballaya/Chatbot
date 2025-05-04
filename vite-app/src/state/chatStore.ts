import { create } from "zustand";
import { initiatePrompt } from "../api/prompt";
import { decideImage } from "../api/decideImage";
import { generateImage } from "../api/generateImage";

export type ChatRole = "user" | "assistant" | "system";
export type ChatStatus = "complete" | "streaming" | "error";
export type ChatModel = "gemma3" | "gemma3:1b" | "gemma3:4b";
export type ChatType = "text" | "image";

export type ChatEntry = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  type: ChatType;
  status?: ChatStatus;
};

export interface ChatState {
  responses: ChatEntry[];
  loading: boolean;
  systemPrompt: string;
  aiModel: "" | ChatModel;
  modelList: ChatModel[];
  error?: string;

  setSystemPrompt: (systemPrompt: string) => void;
  setAiModel: (model: ChatModel) => void;
  setModelList: (list: ChatModel[]) => void;

  addEntry: (entry: Omit<ChatEntry, "timestamp">) => void;
  updateEntry: (id: string, patch: Partial<ChatEntry>) => void;

  fetchResponse: (prompt: string) => Promise<void>;
}

const STORAGE_KEY = "chat-history";
const initial: {
  responses: Array<ChatEntry>;
  systemPrompt: string;
  aiModel: ChatModel;
} = JSON.parse(
  localStorage.getItem(STORAGE_KEY) ||
    `{"responses": [], "systemPrompt": "You are a firndly assistant.", "aiModel": "" }`
);

export const useChatStore = create<ChatState>((set, get) => ({
  responses: initial.responses,
  loading: false,
  error: undefined,

  modelList: [],
  aiModel: initial.aiModel,
  systemPrompt: initial.systemPrompt,

  setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
  setAiModel: (aiModel: ChatModel) => set({ aiModel }),
  setModelList: (modelList: ChatModel[]) => set({ modelList }),

  addEntry: (entry: Omit<ChatEntry, "timestamp">) => {
    const newEntry = {
      ...entry,
      timestamp: Date.now(),
      id: entry.id.length > 0 ? entry.id : crypto.randomUUID(),
    };
    const updated = [...get().responses, newEntry];
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        responses: updated,
        systemPrompt: get().systemPrompt,
        aiModel: get().aiModel,
      })
    );
    set({ responses: updated });
  },

  updateEntry: (id: string, patch: Partial<ChatEntry>) => {
    const updated = get().responses.map((m) =>
      m.id === id ? { ...m, ...patch } : m
    );
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        responses: updated,
        systemPrompt: get().systemPrompt,
        aiModel: get().aiModel,
      })
    );
    set({ responses: updated });
  },

  fetchResponse: async (prompt: string) => {
    const state = get();
    if (state.aiModel === "") return;

    set({ error: undefined, loading: true });

    state.addEntry({
      role: "user",
      content: prompt,
      id: "",
      type: "text",
    });

    const needsImage = await decideImage(prompt, state.aiModel);
    const assistantId = crypto.randomUUID();

    if (needsImage) {
      console.log("Needs image, generating one!");
      state.addEntry({
        role: "assistant",
        content: "",
        id: assistantId,
        status: "streaming",
        type: "image",
      });

      try {
        const base64 = await generateImage(prompt);
        state.updateEntry(assistantId, {
          status: "complete",
          content: base64,
        });
        set({ loading: false });
      } catch (err) {
        get().updateEntry(assistantId, { status: "error" });
        set({ error: (err as Error).message, loading: false });
      }
    } else {
      state.addEntry({
        role: "assistant",
        content: "",
        id: assistantId,
        status: "streaming",
        type: "text",
      });

      try {
        const system = get().systemPrompt;
        const messages: Array<{ role: ChatRole; content: string }> = [
          { role: "system", content: system },
          ...get().responses.map(({ role, content }) => ({ role, content })),
        ];
        let final = "";
        for await (const partial of initiatePrompt(messages, state.aiModel)) {
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
    }
  },
}));
