import ChatHistory from "../components/ChatHistory";
import InputBar from "../components/InputBar";
import SettingsModal from "../components/SettingsModal";

export function ChatTab() {
  return (
    <>
      <SettingsModal />
      <ChatHistory />
      <InputBar />
    </>
  );
}
