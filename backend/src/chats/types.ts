export type ChatRole = "user" | "tool" | "system" | "agent";

export type ChatEntry = {
  _id?: string;
  role: ChatRole;
  content: string;
};

export type Chat = {
  name: string;
  chatHistory: ChatEntry[];
};
