import { Select } from "../common/Select";
import { usePlanner } from "../../hooks/usePlanner";
import { useDegreeProgress } from "../../hooks/useDegreeProgress";

export function Header() {
  const { degrees, majorId, minorId, selectMajor, selectMinor, plan } = usePlanner();
  const { majorProgress, minorProgress } = useDegreeProgress();

  const majors = degrees.filter((degree) => degree.type === "major");
  const minors = degrees.filter((degree) => degree.type === "minor");

  return (
    <header className="app-header">
      <div className="app-header-brand">
        <h1>BYUI Grad Planner</h1>
        <p>Plan courses, track requirements, and graduate on time.</p>
      </div>

      <div className="app-header-controls">
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

      <div className="app-header-summary">
        {majorProgress && (
          <div className="summary-card">
            <span>Major progress</span>
            <strong>{majorProgress.percentComplete}% complete</strong>
            <small>
              {majorProgress.completedCredits} completed · {majorProgress.plannedCredits} planned
            </small>
          </div>
        )}
        {minorProgress && (
          <div className="summary-card">
            <span>Minor progress</span>
            <strong>
              {minorProgress.completedCredits + minorProgress.plannedCredits}/
              {minorProgress.totalRequired} credits
            </strong>
          </div>
        )}
        <div className="summary-card">
          <span>Completed courses</span>
          <strong>{plan.completedCourseIds.length}</strong>
        </div>
      </div>
    </header>
  );
}
