import Header from "./components/Header";
import ChatHistory from "./components/ChatHistory";
import InputBar from "./components/InputBar";

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 dark">
      <Header title="Chatter Bot" />
      <ChatHistory />
      <InputBar />
    </div>
  );
}
