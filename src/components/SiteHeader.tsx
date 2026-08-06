export default function SiteHeader() {
  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center border-b border-white/10 bg-zinc-900 px-4 text-zinc-100">
      <div className="flex items-baseline gap-2 overflow-hidden">
        <span className="text-lg">🌌</span>
        <span className="truncate font-semibold">光污染地图</span>
        <span className="hidden truncate text-xs text-zinc-400 sm:inline">发现观星的最佳暗夜地点</span>
      </div>
    </header>
  );
}
