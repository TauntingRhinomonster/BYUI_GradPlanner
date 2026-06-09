import { useState } from "react";
import { CourseCard } from "../planner/CourseCard";
import { RequirementGroup } from "../requirements/RequirementGroup";
import { ProgressBar } from "../requirements/ProgressBar";
import { CollapsibleSidebarSection } from "./CollapsibleSidebarSection";
import { usePlanner } from "../../hooks/usePlanner";
import { useDegreeProgress } from "../../hooks/useDegreeProgress";

export function Sidebar() {
  const { plan, getCourseById, markIncomplete } = usePlanner();
  const { majorProgress, minorProgress } = useDegreeProgress();
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [majorExpanded, setMajorExpanded] = useState(false);
  const [minorExpanded, setMinorExpanded] = useState(false);

  const completedCount = plan.completedCourseIds.length;

  return (
    <aside className="sidebar">
      <CollapsibleSidebarSection
        panelId="completed-courses-panel"
        title="Completed Courses"
        badge={completedCount > 0 ? completedCount : undefined}
        expanded={completedExpanded}
        onToggle={() => setCompletedExpanded((prev) => !prev)}
        className="completed-section"
      >
        <div className="completed-list">
          <p className="sidebar-note">Completed courses are shown in blue.</p>
          {plan.completedCourseIds.length === 0 && (
            <p className="sidebar-empty">No completed courses yet.</p>
          )}
          {plan.completedCourseIds.map((courseId) => {
            const course = getCourseById(courseId);
            if (!course) return null;

            return (
              <CourseCard
                key={courseId}
                code={course.code}
                title={course.title}
                credits={course.credits}
                status="completed"
                onMarkIncomplete={() => markIncomplete(courseId)}
              />
            );
          })}
        </div>
      </CollapsibleSidebarSection>

      {majorProgress && (
        <CollapsibleSidebarSection
          panelId="major-requirements-panel"
          title="Major Requirements"
          badge={`${majorProgress.percentComplete}%`}
          expanded={majorExpanded}
          onToggle={() => setMajorExpanded((prev) => !prev)}
        >
          <ProgressBar
            label="Overall major"
            value={majorProgress.completedCredits + majorProgress.plannedCredits}
            max={majorProgress.totalRequired}
            detail={`${majorProgress.remainingCredits} credits remaining`}
          />
          {majorProgress.groups.map((group) => (
            <RequirementGroup key={group.groupId} group={group} />
          ))}
        </CollapsibleSidebarSection>
      )}

      {minorProgress && (
        <CollapsibleSidebarSection
          panelId="minor-requirements-panel"
          title="Minor Requirements"
          badge={`${minorProgress.completedCredits + minorProgress.plannedCredits}/${minorProgress.totalRequired}`}
          expanded={minorExpanded}
          onToggle={() => setMinorExpanded((prev) => !prev)}
        >
          <ProgressBar
            label="Overall minor"
            value={minorProgress.completedCredits + minorProgress.plannedCredits}
            max={minorProgress.totalRequired}
            detail={`${minorProgress.remainingCredits} credits remaining`}
          />
          {minorProgress.groups.map((group) => (
            <RequirementGroup key={group.groupId} group={group} />
          ))}
        </CollapsibleSidebarSection>
      )}

      <section className="sidebar-section legend">
        <h2>Legend</h2>
        <ul>
          <li>
            <span className="legend-swatch legend-swatch--completed" />
            Blue — completed
          </li>
          <li>
            <span className="legend-swatch legend-swatch--planned" />
            Green — planned or in progress
          </li>
        </ul>
      </section>
    </aside>
  );
}
