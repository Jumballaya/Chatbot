type HeaderProps = {
  title: string;
};

export default function Header(props: HeaderProps) {
  return (
    <header className="h-12 shrink-0 flex items-center px-4 border-b border-zinc-800">
      <h1 className="text-lg font-semibold tracking-wide">{props.title}</h1>
    </header>
  );
}
