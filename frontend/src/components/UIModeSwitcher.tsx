import { useUIStore } from "../state/uiStore";

const modes = ["agent-chat", "graph-editor", "file-editor"] as const;

export default function UIModeSwitcher() {
  const { mode, setMode } = useUIStore();

  return (
    <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden text-sm">
      {modes.map((m) => (
        <button
          key={m}
          className={`px-3 py-1 transition-all ${
            mode === m
              ? "bg-indigo-600 text-white"
              : "hover:bg-zinc-300 dark:hover:bg-zinc-700"
          }`}
          onClick={() => setMode(m)}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
