export type CourseId = string;

export type Season = "Fall" | "Winter" | "Spring";

export interface Term {
  season: Season;
  year: number;
}

export interface Course {
  id: CourseId;
  code: string;
  title: string;
  credits: number;
  prerequisites: CourseId[];
  offeredTerms: Term[];
}

export type DegreeType = "major" | "minor";

export interface RequirementGroup {
  id: string;
  name: string;
  requiredCredits: number;
  courseOptions: CourseId[];
}

export interface Degree {
  id: string;
  name: string;
  type: DegreeType;
  totalCreditsRequired: number;
  requirements: RequirementGroup[];
}

export interface PlannedSemester {
  id: string;
  term: Term;
  courseIds: CourseId[];
}

export type CourseStatus = "completed" | "in-progress" | "planned";

export interface DegreePlan {
  majorId: string | null;
  minorId: string | null;
  semesters: PlannedSemester[];
  completedCourseIds: CourseId[];
  currentSemesterId: string | null;
  updatedAt: string;
}

export interface RequirementProgress {
  groupId: string;
  groupName: string;
  requiredCredits: number;
  earnedCredits: number;
  plannedCredits: number;
  satisfiedCourseIds: CourseId[];
  remainingCourseIds: CourseId[];
}

export interface DegreeProgressSummary {
  totalRequired: number;
  completedCredits: number;
  plannedCredits: number;
  inProgressCredits: number;
  remainingCredits: number;
  percentComplete: number;
  groups: RequirementProgress[];
}

export interface PlannerCatalog {
  courses: Course[];
  degrees: Degree[];
}

export interface PlannerState extends DegreePlan {
  courses: Course[];
  degrees: Degree[];
}

export function formatTerm(term: Term): string {
  return `${term.season} ${term.year}`;
}

export function termKey(term: Term): string {
  return `${term.season}-${term.year}`;
}
