import { useChatStore } from "../state/chatStore";
import UIModeSwitcher from "./UIModeSwitcher";

type HeaderProps = {
  title: string;
};

export default function Header(props: HeaderProps) {
  const setSettingsActive = useChatStore((s) => s.setSettingsActive);

  return (
    <header className="h-16 w-full shrink-0 flex items-center justify-between px-4 border-b dark:border-zinc-800 border-zinc-300">
      <h1 className="text-3xl font-semibold tracking-wide">
        <span
          className="px-3 cursor-pointer"
          onClick={() => setSettingsActive(true)}
        >
          ⚙️
        </span>{" "}
        {props.title}
      </h1>

      <UIModeSwitcher />
    </header>
  );
}
