import { useEffect, useState } from "react";
import { useChatStore } from "../state/chatStore";
import Button from "./Button";

export default function SettingsModal() {
  const [settings, setSettings] = useState("");

  const setSettingsActive = useChatStore((s) => s.setSettingsActive);
  const settingsActive = useChatStore((s) => s.settingsActive);
  const systemPrompt = useChatStore((s) => s.systemPrompt);
  const setSystemPrompt = useChatStore((s) => s.setSystemPrompt);

  useEffect(() => {
    setSettings(systemPrompt);
  }, []);

  if (!settingsActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-2xl w-full max-w-md p-6 pt-3 relative">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-4">
          AI System Settings
        </h2>

        <div className="mb-4">
          <textarea
            value={settings}
            onChange={(e) => {
              setSettings(e.target.value);
            }}
            rows={4}
            className="w-full px-3 py-2 rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-white resize-none"
          />
        </div>

        <div className="flex justify-end">
          <Button
            label="Save"
            variant="primary"
            onClick={() => {
              setSystemPrompt(settings);
              setSettingsActive(false);
            }}
          />
        </div>

        <button
          onClick={() => setSettingsActive(false)}
          className="absolute text-2xl top-0 right-3 text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
