import { useEffect } from "react";
import { useChatStore } from "../state/chatStore";
import Select from "./Select";
import { getModelList } from "../api/modelList";

type HeaderProps = {
  title: string;
};

export default function Header(props: HeaderProps) {
  const aiModel = useChatStore((s) => s.aiModel);
  const loading = useChatStore((s) => s.loading);
  const modelList = useChatStore((s) => s.modelList);
  const setModelList = useChatStore((s) => s.setModelList);
  const setAiModel = useChatStore((s) => s.setAiModel);
  const setSettingsActive = useChatStore((s) => s.setSettingsActive);

  useEffect(() => {
    getModelList().then((list) => {
      setModelList(list);
      if (aiModel === "") {
        setAiModel(list[0]);
      }
    });
  }, []);

  return (
    <header className="h-12 w-full shrink-0 flex items-center justify-between px-4 border-b border-zinc-800">
      <h1 className="text-xl font-semibold tracking-wide">
        {props.title}{" "}
        <span
          className="px-3 cursor-pointer"
          onClick={() => setSettingsActive(true)}
        >
          ⚙️
        </span>
      </h1>

      <Select
        label="Models"
        value={aiModel}
        onChange={(model) => {
          setAiModel(model);
        }}
        options={modelList.map((m) => ({ key: m, value: m }))}
        placeholder="Choose your model"
        disabled={loading}
      />
    </header>
  );
}
