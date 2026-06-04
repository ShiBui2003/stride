// Post-run summary card showing distance, time, pace, and territory captured
import { Card } from '@/components/ui/Card';
import { formatDistance, formatDuration, formatPace, formatArea } from '@/lib/utils/formatters';
import type { Run } from '@/types/run.types';

interface RunSummaryCardProps {
  run: Run;
  capturedAreaM2?: number;
}

export function RunSummaryCard({ run, capturedAreaM2 }: RunSummaryCardProps) {
  return (
    <Card className="space-y-5">
      <h2 className="font-heading text-2xl font-bold text-textPrimary">Run Complete</h2>
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Distance" value={formatDistance(run.distance_m)} />
        <Stat label="Duration" value={formatDuration(run.duration_s)} />
        <Stat label="Avg Pace" value={`${formatPace(run.pace_s_per_km)}/km`} />
        <Stat label="Calories" value={`${Math.round(run.calories)} cal`} />
      </div>
      {capturedAreaM2 !== undefined && capturedAreaM2 > 0 && (
        <div className="pt-3 border-t border-white/5">
          <Stat label="Territory Captured" value={formatArea(capturedAreaM2)} accent />
        </div>
      )}
    </Card>
  );
}

interface StatProps {
  label: string;
  value: string;
  accent?: boolean;
}

function Stat({ label, value, accent = false }: StatProps) {
  return (
    <div>
      <p className={`font-stats text-3xl leading-none ${accent ? 'text-accent' : 'text-textPrimary'}`}>
        {value}
      </p>
      <p className="text-xs text-textSecondary uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}
