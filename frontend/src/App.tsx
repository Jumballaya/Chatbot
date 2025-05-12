import Header from "./components/Header";
import SettingsModal from "./components/SettingsModal";
import { useChatStore } from "./state/chatStore";
import { useUIStore } from "./state/uiStore";
import { ChatTab } from "./tabs/Chat";
import FileEditorTab from "./tabs/FileEditor";
import { GraphEditorTab } from "./tabs/GraphEditor";

// set darkmode here

export default function App() {
  const darkMode = useChatStore((s) => s.darkMode);
  const mode = useUIStore((s) => s.mode);

  return (
    <div
      className={`${
        darkMode ? "dark" : ""
      } h-screen flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100`}
    >
      <SettingsModal />
      <Header title="Chat" />
      {mode === "agent-chat" && <ChatTab />}
      {mode === "graph-editor" && <GraphEditorTab />}
      {mode === "file-editor" && <FileEditorTab />}
    </div>
  );
}
