const GRADIENT = "linear-gradient(to right, #000000, #1a1a2e, #16213e, #e94560, #f9ed69, #ffffff)";

export default function Legend() {
  return (
    <div className="fixed bottom-4 left-4 z-10 w-56 rounded-md border border-white/10 bg-zinc-900/90 px-3 py-2 text-xs text-zinc-100 shadow-lg backdrop-blur">
      <div className="mb-1 font-medium">光污染强度（VIIRS 卫星数据）</div>
      <div className="h-2 w-full rounded-full" style={{ background: GRADIENT }} />
      <div className="mt-1 flex justify-between text-zinc-400">
        <span>暗</span>
        <span>亮</span>
      </div>
      <div className="mt-2 text-zinc-400">点击地图查看该点的 Bortle 等级与近似 SQM 值</div>
    </div>
  );
}
