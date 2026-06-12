interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  detail?: string;
  showLegend?: boolean;
}

export function ProgressBar({ label, value, max, detail, showLegend = false }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="progress-bar">
      <div className="progress-bar-labels">
        <span className="progress-bar-title">{label}</span>
        <span className="progress-bar-credits">
          {value}/{max} credits
        </span>
      </div>
      <div className="progress-bar-track progress-bar-track--iplan" aria-hidden="true">
        <div className="progress-bar-fill progress-bar-fill--iplan" style={{ width: `${percent}%` }} />
      </div>
      {detail && <p className="progress-bar-detail">{detail}</p>}
      {showLegend && (
        <ul className="progress-bar-legend">
          <li>
            <span className="legend-swatch legend-swatch--completed" />
            Completed
          </li>
          <li>
            <span className="legend-swatch legend-swatch--planned" />
            Planned / Enrolled
          </li>
          <li>
            <span className="legend-swatch legend-swatch--unplanned" />
            Unplanned
          </li>
        </ul>
      )}
    </div>
  );
}
