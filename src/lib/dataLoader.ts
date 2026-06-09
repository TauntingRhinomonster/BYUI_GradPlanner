import coursesData from "../assets/data/courses.json";
import degreesData from "../assets/data/degrees.json";
import type { Course, Degree, PlannerCatalog } from "../types";

export function loadCatalog(): PlannerCatalog {
  return {
    courses: coursesData as Course[],
    degrees: degreesData as Degree[],
  };
}

export function getCourseMap(courses: Course[]): Map<string, Course> {
  return new Map(courses.map((course) => [course.id, course]));
}

export function getDegreeById(degrees: Degree[], id: string | null): Degree | undefined {
  if (!id) return undefined;
  return degrees.find((degree) => degree.id === id);
}
