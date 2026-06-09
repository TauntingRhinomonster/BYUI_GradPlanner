interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  detail?: string;
}

export function ProgressBar({ label, value, max, detail }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="progress-bar">
      <div className="progress-bar-labels">
        <span>{label}</span>
        <span>
          {value}/{max} credits
        </span>
      </div>
      <div className="progress-bar-track" aria-hidden="true">
        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      {detail && <p className="progress-bar-detail">{detail}</p>}
    </div>
  );
}
