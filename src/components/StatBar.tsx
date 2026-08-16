import { motion } from "framer-motion";
import { useCountUp } from "../lib/useCountUp";
import { formatINR } from "../lib/format";

interface Props {
  label: string;
  sublabel: string;
  value: number;
  maxValue: number;
  colorClass: string;
  delay: number;
}

export default function StatBar({ label, sublabel, value, maxValue, colorClass, delay }: Props) {
  const displayValue = useCountUp(value, 1200);
  const widthPct = Math.max(4, Math.min(100, (value / maxValue) * 100));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="font-display text-base font-bold text-ink sm:text-lg">{label}</p>
          <p className="text-xs text-mist sm:text-sm">{sublabel}</p>
        </div>
        <p className="whitespace-nowrap font-mono text-xl font-bold text-ink sm:text-2xl">
          {formatINR(displayValue)}
        </p>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-card-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${widthPct}%` }}
          transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
    </div>
  );
}
