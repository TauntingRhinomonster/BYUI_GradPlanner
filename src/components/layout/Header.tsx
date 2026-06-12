import { Select } from "../common/Select";
import { usePlanner } from "../../hooks/usePlanner";
import { useDegreeProgress } from "../../hooks/useDegreeProgress";
import { getDegreeById } from "../../lib/dataLoader";
import { getCreditSummary } from "../../lib/progress";

export function Header() {
  const { degrees, majorId, minorId, selectMajor, selectMinor, courses, plan } = usePlanner();
  const { majorProgress } = useDegreeProgress();

  const majors = degrees.filter((degree) => degree.type === "major");
  const minors = degrees.filter((degree) => degree.type === "minor");
  const selectedMajor = getDegreeById(degrees, majorId);
  const selectedMinor = getDegreeById(degrees, minorId);

  const summary = majorProgress
    ? getCreditSummary(courses, plan, majorProgress.totalRequired)
    : null;

  return (
    <>
      <header className="app-topbar">
        <div className="app-topbar-brand">
          <span className="app-topbar-logo">I-Plan</span>
          <span className="app-topbar-divider">|</span>
          <span className="app-topbar-title">Grad Planner</span>
        </div>
        <nav className="app-topbar-nav" aria-label="Primary">
          <span className="app-topbar-link app-topbar-link--active">My Plan</span>
          <span className="app-topbar-link">What-If</span>
          <span className="app-topbar-link">Goals</span>
        </nav>
      </header>

      <section className="app-subheader">
        <div className="app-subheader-plan">
          <h1>{selectedMajor?.name ?? "Select a Plan"}</h1>
          {selectedMinor && <span className="declared-badge">{selectedMinor.name}</span>}
          {majorId && <span className="declared-badge declared-badge--green">Declared Plan</span>}
        </div>

        <div className="app-subheader-controls">
          <Select
            label="Major"
            value={majorId ?? ""}
            onChange={(event) => selectMajor(event.target.value || null)}
            options={[
              { value: "", label: "Select a major" },
              ...majors.map((degree) => ({ value: degree.id, label: degree.name })),
            ]}
          />
          <Select
            label="Minor"
            value={minorId ?? ""}
            onChange={(event) => selectMinor(event.target.value || null)}
            options={[
              { value: "", label: "No minor" },
              ...minors.map((degree) => ({ value: degree.id, label: degree.name })),
            ]}
          />
        </div>

        {summary && (
          <div className="credit-summary">
            <div className="credit-summary-item">
              <span className="credit-summary-label">Completed</span>
              <strong className="credit-summary-value credit-summary-value--blue">
                {summary.completed}
              </strong>
            </div>
            <div className="credit-summary-item">
              <span className="credit-summary-label">In-Progress</span>
              <strong className="credit-summary-value credit-summary-value--blue">
                {summary.inProgress}
              </strong>
            </div>
            <div className="credit-summary-item">
              <span className="credit-summary-label">Planned</span>
              <strong className="credit-summary-value credit-summary-value--green">
                {summary.planned}
              </strong>
            </div>
            <div className="credit-summary-item">
              <span className="credit-summary-label">Unplanned</span>
              <strong className="credit-summary-value credit-summary-value--muted">
                {summary.unplanned}
              </strong>
            </div>
            <div className="credit-summary-item">
              <span className="credit-summary-label">Total</span>
              <strong className="credit-summary-value">{summary.total}</strong>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
