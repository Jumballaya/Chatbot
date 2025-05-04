import Header from "./components/Header";
import ChatHistory from "./components/ChatHistory";
import InputBar from "./components/InputBar";
import SettingsModal from "./components/SettingsModal";
import { useChatStore } from "./state/chatStore";

// set darkmode here

export default function App() {
  const darkMode = useChatStore((s) => s.darkMode);

  return (
    <div
      className={`${
        darkMode ? "dark" : ""
      } h-screen flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100`}
    >
      <Header title="Chat" />
      <SettingsModal />
      <ChatHistory />
      <InputBar />
    </div>
  );
}
