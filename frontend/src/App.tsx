import GlobalVariableEditor from "./components/graph/GlobalVariableEditor";
import Header from "./components/Header";
import SettingsModal from "./components/SettingsModal";
import { useUIStore } from "./state/uiStore";
import ChatTab from "./tabs/Chat";
import FileEditorTab from "./tabs/FileEditor";
import GraphEditorTab from "./tabs/GraphEditor";

// set darkmode here on the conrainer div

export default function App() {
  const darkMode = useUIStore((s) => s.darkMode);
  const mode = useUIStore((s) => s.mode);

  return (
    <div
      className={`${
        darkMode ? "dark" : ""
      } h-screen flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100`}
    >
      <SettingsModal />
      <Header />
      {mode === "agent-chat" && <ChatTab />}
      <GlobalVariableEditor visible={mode === "graph-editor"} />
      {mode === "graph-editor" && <GraphEditorTab />}
      {mode === "file-editor" && <FileEditorTab />}
    </div>
  );
}
