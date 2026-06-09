import type { RequirementProgress } from "../../types";
import { ProgressBar } from "./ProgressBar";
import { usePlanner } from "../../hooks/usePlanner";

interface RequirementGroupProps {
  group: RequirementProgress;
}

export function RequirementGroup({ group }: RequirementGroupProps) {
  const { getCourseById } = usePlanner();

  const totalApplied = group.earnedCredits + group.plannedCredits;

  return (
    <article className="requirement-group">
      <ProgressBar
        label={group.groupName}
        value={totalApplied}
        max={group.requiredCredits}
        detail={`${group.earnedCredits} completed · ${group.plannedCredits} planned`}
      />

      {group.remainingCourseIds.length > 0 && (
        <div className="requirement-remaining">
          <h4>Still needed</h4>
          <ul>
            {group.remainingCourseIds.map((courseId) => {
              const course = getCourseById(courseId);
              return (
                <li key={courseId}>
                  {course ? `${course.code} — ${course.title}` : courseId}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </article>
  );
}
