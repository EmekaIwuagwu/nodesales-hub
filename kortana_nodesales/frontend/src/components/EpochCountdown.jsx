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
    <div className="flex gap-4 justify-center">
      {[{ label: "HRS",  val: h }, { label: "MIN", val: m }, { label: "SEC", val: s }].map(u => (
        <div key={u.label} className="text-center">
          <div className="text-4xl font-black font-mono text-kortana-accent">{pad(u.val)}</div>
          <div className="text-xs text-gray-500 mt-1">{u.label}</div>
        </div>
      ))}
    </div>
  );
}
