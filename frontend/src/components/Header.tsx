import { useChatStore } from "../state/chatStore";
import { useGraphStore } from "../state/graphStore";
import { useUIStore } from "../state/uiStore";
import UIModeSwitcher from "./UIModeSwitcher";

export default function Header() {
  const setSettingsActive = useChatStore((s) => s.setSettingsActive);
  const title = useUIStore((s) => s.title);
  const currentGraph = useGraphStore((s) => s.activeGraphId);
  const subTitle = currentGraph;

  return (
    <header className="h-16 w-full shrink-0 flex items-center justify-between px-4 border-b dark:border-zinc-800 border-zinc-300">
      <h1 className="text-3xl font-semibold tracking-wide">
        <span
          className="px-3 cursor-pointer"
          onClick={() => setSettingsActive(true)}
        >
          ⚙️
        </span>
        {title} {">"} {subTitle}
      </h1>

      <UIModeSwitcher />
    </header>
  );
}
