import { useMemo, useState } from "react";
import { usePlanner } from "../../hooks/usePlanner";
import { useDegreeProgress } from "../../hooks/useDegreeProgress";
import { getDegreeById } from "../../lib/dataLoader";
import { getCourseStatusLabel } from "../../lib/progress";
import { ProgressBar } from "../requirements/ProgressBar";
import { CourseCatalog } from "../catalog/CourseCatalog";
import { CollapsibleSidebarSection } from "./CollapsibleSidebarSection";
import type { RequirementProgress } from "../../types";

interface RequirementTab {
  id: string;
  label: string;
  group?: RequirementProgress;
  kind: "completed" | "requirement";
}

function RequirementCourseRow({
  courseId,
  statusLabel,
  status,
}: {
  courseId: string;
  statusLabel: string;
  status: "completed" | "planned" | "in-progress" | "unplanned";
}) {
  const { getCourseById } = usePlanner();
  const course = getCourseById(courseId);
  if (!course) return null;

  return (
    <article className={`requirement-course-row requirement-course-row--${status}`}>
      <div className="requirement-course-row-main">
        <strong>{course.title}</strong>
        <span>{course.code}</span>
      </div>
      <button type="button" className="requirement-course-row-link">
        View Details
      </button>
      <span className="requirement-course-row-credits">{course.credits}</span>
      <span className={`requirement-course-row-status requirement-course-row-status--${status}`}>
        {statusLabel}
      </span>
    </article>
  );
}

function RequirementTabPanel({ group }: { group: RequirementProgress }) {
  const { plan, getCourseById } = usePlanner();

  const courseRows = group.satisfiedCourseIds
    .concat(group.remainingCourseIds)
    .filter((id, index, ids) => ids.indexOf(id) === index);

  return (
    <div className="requirement-tab-panel">
      <ProgressBar
        label={group.groupName}
        value={group.earnedCredits + group.plannedCredits}
        max={group.requiredCredits}
        showLegend
      />

      <div className="requirement-course-list">
        {courseRows.map((courseId) => {
          const course = getCourseById(courseId);
          if (!course) return null;

          let status: "completed" | "planned" | "in-progress" | "unplanned" = "unplanned";
          if (plan.completedCourseIds.includes(courseId)) {
            status = "completed";
          } else if (plan.currentSemesterId) {
            const currentSemester = plan.semesters.find((s) => s.id === plan.currentSemesterId);
            if (currentSemester?.courseIds.includes(courseId)) {
              status = "in-progress";
            } else if (plan.semesters.some((s) => s.courseIds.includes(courseId))) {
              status = "planned";
            }
          } else if (plan.semesters.some((s) => s.courseIds.includes(courseId))) {
            status = "planned";
          }

          return (
            <RequirementCourseRow
              key={courseId}
              courseId={courseId}
              status={status}
              statusLabel={getCourseStatusLabel(courseId, plan)}
            />
          );
        })}
      </div>
    </div>
  );
}

export function RequirementsPanel() {
  const { plan, getCourseById, degrees, majorId, minorId } = usePlanner();
  const { majorProgress, minorProgress } = useDegreeProgress();
  const [activeTabId, setActiveTabId] = useState<string>("");
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [majorExpanded, setMajorExpanded] = useState(false);
  const [minorExpanded, setMinorExpanded] = useState(false);

  const tabs = useMemo(() => {
    const items: RequirementTab[] = [];

    if (majorProgress) {
      for (const group of majorProgress.groups) {
        items.push({
          id: `major-${group.groupId}`,
          label: group.groupName,
          group,
          kind: "requirement",
        });
      }
    }

    if (minorProgress) {
      for (const group of minorProgress.groups) {
        items.push({
          id: `minor-${group.groupId}`,
          label: group.groupName,
          group,
          kind: "requirement",
        });
      }
    }

    return items;
  }, [majorProgress, minorProgress]);

  const selectedTabId = activeTabId || tabs[0]?.id || "completed";
  const selectedTab = tabs.find((tab) => tab.id === selectedTabId);

  const majorName = getDegreeById(degrees, majorId)?.name;
  const minorName = getDegreeById(degrees, minorId)?.name;

  return (
    <section className="requirements-panel">
      <header className="requirements-panel-header">
        <div>
          <h2>Requirements &amp; Courses</h2>
          <p className="requirements-panel-subtitle">
            {majorName}
            {minorName ? ` · ${minorName}` : ""}
          </p>
        </div>
      </header>

      <CollapsibleSidebarSection
        panelId="completed-courses-panel"
        title="Completed Courses"
        badge={plan.completedCourseIds.length || undefined}
        expanded={completedExpanded}
        onToggle={() => setCompletedExpanded((prev) => !prev)}
        className="completed-section requirements-completed-section"
      >
        <p className="sidebar-note">Completed courses are shown in blue.</p>
        <div className="completed-list">
          {plan.completedCourseIds.length === 0 && (
            <p className="sidebar-empty">No completed courses yet.</p>
          )}
          {plan.completedCourseIds.map((courseId) => {
            const course = getCourseById(courseId);
            if (!course) return null;

            return (
              <RequirementCourseRow
                key={courseId}
                courseId={courseId}
                status="completed"
                statusLabel={getCourseStatusLabel(courseId, plan)}
              />
            );
          })}
        </div>
      </CollapsibleSidebarSection>

      <div className="requirements-desktop-tabs">
        <div className="requirements-tabs" role="tablist" aria-label="Requirement categories">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selectedTabId === tab.id}
              className={`requirements-tab ${selectedTabId === tab.id ? "requirements-tab--active" : ""}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {selectedTab?.group && <RequirementTabPanel group={selectedTab.group} />}
      </div>

      <div className="requirements-mobile-sections">
        {majorProgress && (
          <CollapsibleSidebarSection
            panelId="major-requirements-panel"
            title="Major Requirements"
            badge={`${majorProgress.percentComplete}%`}
            expanded={majorExpanded}
            onToggle={() => setMajorExpanded((prev) => !prev)}
          >
            {majorProgress.groups.map((group) => (
              <RequirementTabPanel key={group.groupId} group={group} />
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
            {minorProgress.groups.map((group) => (
              <RequirementTabPanel key={group.groupId} group={group} />
            ))}
          </CollapsibleSidebarSection>
        )}
      </div>

      <section className="requirements-catalog">
        <CourseCatalog />
      </section>

      <section className="requirements-legend legend">
        <ul>
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
      </section>
    </section>
  );
}
