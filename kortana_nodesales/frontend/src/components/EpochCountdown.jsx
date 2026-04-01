import { useState, useEffect } from "react";

function pad(n) { return String(n).padStart(2, "0"); }

export default function EpochCountdown({ targetTime }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!targetTime) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(targetTime) - Date.now()) / 1000));
      setRemaining(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTime]);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  return (
    <div className="flex gap-3 justify-center">
      {[{ label: "HRS", val: h }, { label: "MIN", val: m }, { label: "SEC", val: s }].map((u, i) => (
        <div key={u.label} className="flex items-center gap-3">
          <div className="text-center">
            <div className="relative bg-kortana-950/80 border border-kortana-accent/20 rounded-xl px-4 py-3 min-w-[64px]">
              <div className="text-4xl font-black font-mono text-kortana-accent tabular-nums text-glow">
                {pad(u.val)}
              </div>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kortana-accent/30 to-transparent" />
            </div>
            <div className="text-xs text-gray-600 mt-2 uppercase tracking-widest font-semibold">{u.label}</div>
          </div>
          {i < 2 && (
            <div className="text-2xl font-black text-kortana-accent/30 mb-5 select-none">:</div>
          )}
        </div>
      ))}
    </div>
  );
}
