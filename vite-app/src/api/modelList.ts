import { ChatModel } from "../state/chatStore";
import { baseURL } from "./apis";

type GetModelsResponse = {
  models: [
    {
      name: ChatModel;
      model: ChatModel;
      modified_at: string;
      size: number;
      digest: string;
      details: {
        parent_model: string;
        format: string;
        family: string;
        families: string[];
        parameter_size: string;
        quantization_level: string;
      };
    }
  ];
};

export async function getModelList(): Promise<ChatModel[]> {
  const res = await fetch(`${baseURL}/api/tags`, { method: "GET" });
  const json: GetModelsResponse = await res.json();
  return (json.models || []).map((model) => model.name);
}
