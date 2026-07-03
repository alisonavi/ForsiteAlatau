const PATHS: Record<string, JSX.Element> = {
  home: (
    <path d="M3 10.5L12 3l9 7.5M5 9.5V20h14V9.5" />
  ),
  radar: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 12l6-4" />
      <circle cx="18" cy="8" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 16v-4M12 16V8M16 16v-6M20 16v-2" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 12l9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2.5" />
      <path d="M11 18h2" />
    </>
  ),
  cube: (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
    </>
  ),
  megaphone: (
    <>
      <path d="M4 10v4l10 4V6L4 10z" />
      <path d="M14 8a3 3 0 010 8M7 14v3a2 2 0 004 0" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0111 0" />
      <path d="M16 5.5a3 3 0 010 5.8M15.5 20a5.5 5.5 0 015-3" />
    </>
  ),
  map: (
    <>
      <path d="M9 4L4 6v14l5-2 6 2 5-2V4l-5 2-6-2z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  userCheck: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0111 0" />
      <path d="M15.5 12.5l1.8 1.8 3.2-3.4" />
    </>
  ),
  balance: (
    <>
      <path d="M12 4v16M7 20h10" />
      <path d="M6 6h12M6 6l-3 6a3 3 0 006 0L6 6zM18 6l-3 6a3 3 0 006 0l-3-6z" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7.5A2.5 2.5 0 016.5 5H18v3" />
      <rect x="3.5" y="7.5" width="17" height="12" rx="2.5" />
      <path d="M20.5 12.5H16a2 2 0 000 4h4.5" />
    </>
  ),
  retention: (
    <>
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M6 20a6 6 0 0110.5-4" />
      <path d="M18.5 12.5v3h-3M18.6 15.4a3.6 3.6 0 01-6.6 1" />
    </>
  ),
};

export default function NavIcon({
  name,
  className = "h-[18px] w-[18px]",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {PATHS[name] ?? PATHS.chart}
    </svg>
  );
}
