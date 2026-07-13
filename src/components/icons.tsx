import type { ReactNode } from "react";

// Реестр иконок для приложений вуза и подсайтов. В YAML указывается ключ (icon),
// сам SVG живёт здесь. Рисуются линией currentColor.
const PATHS: Record<string, ReactNode> = {
  // приложения
  building: (
    <>
      <path d="M3 21V9l9-6 9 6v12" />
      <path d="M9 21v-6h6v6" />
      <path d="M3 21h18" />
    </>
  ),
  monitor: (
    <>
      <path d="M4 5h16v11H4z" />
      <path d="M2 20h20" />
      <path d="M9 9l2 2-2 2" />
      <path d="M13 13h2" />
    </>
  ),
  card: (
    <>
      <path d="M4 5h16v14H4z" />
      <path d="M8 10a2 2 0 1 0 0-.01" />
      <path d="M6 16c.5-1.6 1.9-2.5 3-2.5s2.5.9 3 2.5" />
      <path d="M14 10h4M14 13h4" />
    </>
  ),
  // подсайты
  heart: <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z" />,
  cap: (
    <>
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.2 2.7 2 6 2s6-.8 6-2v-5" />
    </>
  ),
  science: (
    <>
      <path d="M9 3h6" />
      <path d="M10 3v6l-5.2 9.4A2 2 0 0 0 6.6 21h10.8a2 2 0 0 0 1.8-2.6L14 9V3" />
    </>
  ),
  museum: (
    <>
      <path d="M12 3 3 8h18Z" />
      <path d="M5 21V10M9 21V10M15 21V10M19 21V10" />
      <path d="M3 21h18" />
    </>
  ),
  book: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z" />
      <path d="M4 20a2 2 0 0 1 2-2h13" />
    </>
  ),
  grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
};

export function Icon({
  name,
  size = 24,
  strokeWidth = 1.8,
  className,
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name] ?? PATHS.grid}
    </svg>
  );
}
