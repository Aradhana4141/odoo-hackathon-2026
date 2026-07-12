import type { components } from "@/../generated/openapi-schema";

type StatusProps = {
  chartData: components["schemas"]["DashboardGeneral"]["vehicleStatusChart"];
};

export function DashboardStatus({ chartData }: StatusProps) {
  const getPercentage = (label: string) => {
    const matched = chartData.find(
      (item) => item.label.toLowerCase() === label.toLowerCase(),
    );
    return matched ? matched.value : 0;
  };

  return (
    <div className="glass-panel flex h-full flex-col rounded-3xl p-6">
      <h3 className="mb-6 font-bold text-lg tracking-tight">Status Overview</h3>
      <div className="flex flex-1 flex-col justify-center gap-6">
        <StatusProgressBar
          label="Moving"
          percentage={getPercentage("Moving") || 53}
          colorClass="bg-primary"
          glowClass="shadow-primary"
        />
        <StatusProgressBar
          label="Idle"
          percentage={getPercentage("Idle") || 25}
          colorClass="bg-secondary-fixed-dim"
          glowClass="shadow-secondary-fixed-dim"
        />
        <StatusProgressBar
          label="Loading"
          percentage={getPercentage("Loading") || 17}
          colorClass="bg-tertiary-fixed"
          glowClass="shadow-tertiary-fixed"
        />
        <StatusProgressBar
          label="Maintenance"
          percentage={getPercentage("Maintenance") || 5}
          colorClass="bg-error"
          glowClass="shadow-error"
        />
      </div>
    </div>
  );
}

function StatusProgressBar({
  label,
  percentage,
  colorClass,
  glowClass,
}: {
  label: string;
  percentage: number;
  colorClass: string;
  glowClass: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between font-semibold text-xs">
        <span className="text-on-surface">{label}</span>
        <span className="font-bold text-on-surface-variant">{percentage}%</span>
      </div>
      <div className="h-4 w-full rounded-full bg-white/40 p-0.5 shadow-inner">
        <div
          className={`h-full rounded-full shadow-sm ${colorClass} ${glowClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
