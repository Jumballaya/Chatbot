import { useEffect, useState } from "react";
import { useChatStore } from "../state/chatStore";
import Button from "./Button";

export default function SettingsModal() {
  const [settings, setSettings] = useState("");

  const setSettingsActive = useChatStore((s) => s.setSettingsActive);
  const settingsActive = useChatStore((s) => s.settingsActive);
  const systemPrompt = useChatStore((s) => s.systemPrompt);
  const setSystemPrompt = useChatStore((s) => s.setSystemPrompt);
  const darkMode = useChatStore((s) => s.darkMode);
  const setDarkMode = useChatStore((s) => s.setDarkMode);

  useEffect(() => {
    setSettings(systemPrompt);
  }, []);

  if (!settingsActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md p-6 pt-3 relative">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
          AI System Settings
        </h2>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Dark Mode
            </span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 flex items-center bg-zinc-300 dark:bg-zinc-700 rounded-full transition-colors ${
                darkMode ? "bg-zinc-700" : "bg-zinc-300"
              }`}
            >
              <span
                className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
                  darkMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Text Area
          </label>
          <textarea
            value={settings}
            onChange={(e) => {
              setSettings(e.target.value);
            }}
            rows={4}
            className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white resize-none"
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
