import { create } from "zustand";
import { initiatePrompt } from "../api/prompt";
import { decideImage } from "../api/decideImage";
import { generateImage } from "../api/generateImage";
import { extractImageDetails } from "../api/extractImageDetails";

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
  darkMode: boolean;
  error?: string;

  settingsActive: boolean;

  setSystemPrompt: (systemPrompt: string) => void;
  setSettingsActive: (active: boolean) => void;
  setDarkMode: (darkMode: boolean) => void;

  addEntry: (entry: Omit<ChatEntry, "timestamp">) => void;
  updateEntry: (id: string, patch: Partial<ChatEntry>) => void;

  fetchResponse: (prompt: string) => Promise<void>;
}

const STORAGE_KEY = "chat-history";
const SYSTEM_PROMPT_KEY = "chat-system-prompt";
const DARKMODE_KEY = "char-darkmode";

export const useChatStore = create<ChatState>((set, get) => ({
  responses: JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"),
  loading: false,
  error: undefined,
  settingsActive: false,
  darkMode: JSON.parse(localStorage.getItem(DARKMODE_KEY) || "true"),

  systemPrompt:
    localStorage.getItem(SYSTEM_PROMPT_KEY) || "You are a friendly assistant",
  setSystemPrompt: (systemPrompt) => {
    localStorage.setItem(SYSTEM_PROMPT_KEY, systemPrompt);
    set({ systemPrompt });
  },
  setSettingsActive: (settingsActive: boolean) => set({ settingsActive }),
  setDarkMode: (darkMode: boolean) => {
    localStorage.setItem(DARKMODE_KEY, JSON.stringify(darkMode));
    set({ darkMode });
  },

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
    const state = get();

    set({ error: undefined, loading: true });

    state.addEntry({
      role: "user",
      content: prompt,
      id: "",
      type: "text",
    });

    const needsImage = await decideImage(prompt, "gemma3:4b");
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
        const imageDetails = await extractImageDetails(prompt, "gemma3:4b");
        console.log(imageDetails);
        for await (const frame of generateImage(imageDetails)) {
          state.updateEntry(assistantId, {
            content: frame.image_url,
            status: frame.done ? "complete" : "streaming",
          });
        }
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
        for await (const partial of initiatePrompt(messages, "gemma3:4b")) {
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
