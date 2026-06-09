import type {
  Course,
  CourseId,
  CourseStatus,
  Degree,
  DegreePlan,
  DegreeProgressSummary,
  PlannedSemester,
  RequirementProgress,
} from "../types";
import { getCourseMap } from "./dataLoader";

function uniqueCourseIds(ids: CourseId[]): CourseId[] {
  return [...new Set(ids)];
}

export function getAllPlannedCourseIds(semesters: PlannedSemester[]): CourseId[] {
  return uniqueCourseIds(semesters.flatMap((semester) => semester.courseIds));
}

export function getCourseStatus(
  courseId: CourseId,
  plan: Pick<DegreePlan, "completedCourseIds" | "currentSemesterId" | "semesters">,
  semesterId?: string,
): CourseStatus {
  if (plan.completedCourseIds.includes(courseId)) {
    return "completed";
  }

  if (semesterId && plan.currentSemesterId === semesterId) {
    return "in-progress";
  }

  const inCurrentSemester =
    plan.currentSemesterId &&
    plan.semesters
      .find((semester) => semester.id === plan.currentSemesterId)
      ?.courseIds.includes(courseId);

  if (inCurrentSemester) {
    return "in-progress";
  }

  return "planned";
}

function allocateCreditsToGroup(
  groupCourseOptions: CourseId[],
  availableCourseIds: CourseId[],
  courseMap: Map<string, Course>,
  requiredCredits: number,
): { used: CourseId[]; credits: number } {
  const used: CourseId[] = [];
  let credits = 0;

  for (const courseId of availableCourseIds) {
    if (credits >= requiredCredits) break;
    if (!groupCourseOptions.includes(courseId)) continue;
    if (used.includes(courseId)) continue;

    const course = courseMap.get(courseId);
    if (!course) continue;

    used.push(courseId);
    credits += course.credits;
  }

  return { used, credits };
}

function buildGroupProgress(
  group: Degree["requirements"][number],
  completedIds: CourseId[],
  plannedIds: CourseId[],
  courseMap: Map<string, Course>,
): RequirementProgress {
  const completedAllocation = allocateCreditsToGroup(
    group.courseOptions,
    completedIds,
    courseMap,
    group.requiredCredits,
  );

  const remainingNeeded = Math.max(0, group.requiredCredits - completedAllocation.credits);
  const plannedAllocation = allocateCreditsToGroup(
    group.courseOptions,
    plannedIds.filter((id) => !completedAllocation.used.includes(id)),
    courseMap,
    remainingNeeded,
  );

  const satisfied = uniqueCourseIds([
    ...completedAllocation.used,
    ...plannedAllocation.used,
  ]);

  const remainingCourseIds = group.courseOptions.filter(
    (courseId) => !satisfied.includes(courseId),
  );

  const plannedCredits = plannedAllocation.used.reduce(
    (sum, id) => sum + (courseMap.get(id)?.credits ?? 0),
    0,
  );

  return {
    groupId: group.id,
    groupName: group.name,
    requiredCredits: group.requiredCredits,
    earnedCredits: completedAllocation.credits,
    plannedCredits,
    satisfiedCourseIds: satisfied,
    remainingCourseIds,
  };
}

export function calculateDegreeProgress(
  degree: Degree | undefined,
  courses: Course[],
  plan: DegreePlan,
): DegreeProgressSummary | null {
  if (!degree) return null;

  const courseMap = getCourseMap(courses);
  const completedIds = plan.completedCourseIds;
  const plannedIds = getAllPlannedCourseIds(plan.semesters).filter(
    (id) => !completedIds.includes(id),
  );

  const groups = degree.requirements.map((group) =>
    buildGroupProgress(group, completedIds, plannedIds, courseMap),
  );

  const completedCredits = completedIds.reduce(
    (sum, id) => sum + (courseMap.get(id)?.credits ?? 0),
    0,
  );

  const plannedCredits = plannedIds.reduce(
    (sum, id) => sum + (courseMap.get(id)?.credits ?? 0),
    0,
  );

  const inProgressCredits = plan.currentSemesterId
    ? (plan.semesters.find((s) => s.id === plan.currentSemesterId)?.courseIds ?? [])
        .filter((id) => !completedIds.includes(id))
        .reduce((sum, id) => sum + (courseMap.get(id)?.credits ?? 0), 0)
    : 0;

  const totalRequired = degree.totalCreditsRequired;
  const earnedTowardDegree = Math.min(
    totalRequired,
    completedCredits + plannedCredits,
  );
  const percentComplete = totalRequired
    ? Math.round((completedCredits / totalRequired) * 100)
    : 0;

  return {
    totalRequired,
    completedCredits,
    plannedCredits,
    inProgressCredits,
    remainingCredits: Math.max(0, totalRequired - earnedTowardDegree),
    percentComplete,
    groups,
  };
}

export function getRequiredCourseIds(degrees: Degree[], majorId: string | null, minorId: string | null): CourseId[] {
  const ids = new Set<CourseId>();

  for (const degreeId of [majorId, minorId]) {
    if (!degreeId) continue;
    const degree = degrees.find((d) => d.id === degreeId);
    if (!degree) continue;
    for (const group of degree.requirements) {
      for (const courseId of group.courseOptions) {
        ids.add(courseId);
      }
    }
  }

  return [...ids];
}

export function getUnassignedCourses(
  courses: Course[],
  plan: DegreePlan,
): Course[] {
  const assigned = new Set([
    ...plan.completedCourseIds,
    ...getAllPlannedCourseIds(plan.semesters),
  ]);

  return courses.filter((course) => !assigned.has(course.id));
}
