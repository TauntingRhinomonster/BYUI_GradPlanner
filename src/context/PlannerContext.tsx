import {
  createContext,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { loadCatalog } from "../lib/dataLoader";
import { getPlannerStorageKey } from "../lib/storage";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type {
  Course,
  CourseId,
  Degree,
  DegreePlan,
  PlannedSemester,
  Term,
} from "../types";

const catalog = loadCatalog();

function createDefaultSemesters(): PlannedSemester[] {
  const terms: Term[] = [
    { season: "Fall", year: 2025 },
    { season: "Winter", year: 2026 },
    { season: "Spring", year: 2026 },
    { season: "Fall", year: 2026 },
    { season: "Winter", year: 2027 },
    { season: "Spring", year: 2027 },
  ];

  return terms.map((term, index) => ({
    id: `semester-${index}`,
    term,
    courseIds: [],
  }));
}

const defaultPlan: DegreePlan = {
  majorId: "bs-software-engineering",
  minorId: null,
  semesters: createDefaultSemesters(),
  completedCourseIds: ["CSE 110", "CSE 111", "MATH 108", "WRTG 150", "REL 200"],
  currentSemesterId: "semester-1",
  updatedAt: new Date().toISOString(),
};

export interface PlannerContextValue {
  courses: Course[];
  degrees: Degree[];
  plan: DegreePlan;
  majorId: string | null;
  minorId: string | null;
  selectMajor: (id: string | null) => void;
  selectMinor: (id: string | null) => void;
  addCourse: (semesterId: string, courseId: CourseId, index?: number) => void;
  removeCourse: (semesterId: string, courseId: CourseId) => void;
  moveCourse: (
    sourceSemesterId: string,
    destSemesterId: string,
    courseId: CourseId,
    destIndex?: number,
  ) => void;
  reorderCourse: (semesterId: string, courseIds: CourseId[]) => void;
  markCompleted: (courseId: CourseId) => void;
  markIncomplete: (courseId: CourseId) => void;
  setCurrentSemester: (semesterId: string | null) => void;
  addSemester: () => void;
  getCourseById: (id: CourseId) => Course | undefined;
}

export const PlannerContext = createContext<PlannerContextValue | null>(null);

function touchPlan(plan: DegreePlan): DegreePlan {
  return { ...plan, updatedAt: new Date().toISOString() };
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useLocalStorage<DegreePlan>(
    getPlannerStorageKey(),
    defaultPlan,
  );

  const selectMajor = useCallback((id: string | null) => {
    setPlan((prev) => touchPlan({ ...prev, majorId: id }));
  }, [setPlan]);

  const selectMinor = useCallback((id: string | null) => {
    setPlan((prev) => touchPlan({ ...prev, minorId: id }));
  }, [setPlan]);

  const addCourse = useCallback((semesterId: string, courseId: CourseId, index?: number) => {
    setPlan((prev) => {
      const alreadyPlaced = prev.semesters.some((semester) =>
        semester.courseIds.includes(courseId),
      );
      if (alreadyPlaced || prev.completedCourseIds.includes(courseId)) {
        return prev;
      }

      return touchPlan({
        ...prev,
        semesters: prev.semesters.map((semester) => {
          if (semester.id !== semesterId) return semester;

          const nextIds = [...semester.courseIds];
          const insertAt =
            index !== undefined ? Math.min(index, nextIds.length) : nextIds.length;
          nextIds.splice(insertAt, 0, courseId);
          return { ...semester, courseIds: nextIds };
        }),
      });
    });
  }, [setPlan]);

  const removeCourse = useCallback((semesterId: string, courseId: CourseId) => {
    setPlan((prev) =>
      touchPlan({
        ...prev,
        semesters: prev.semesters.map((semester) =>
          semester.id === semesterId
            ? {
                ...semester,
                courseIds: semester.courseIds.filter((id) => id !== courseId),
              }
            : semester,
        ),
      }),
    );
  }, [setPlan]);

  const moveCourse = useCallback(
    (
      sourceSemesterId: string,
      destSemesterId: string,
      courseId: CourseId,
      destIndex?: number,
    ) => {
      setPlan((prev) => {
        const source = prev.semesters.find((s) => s.id === sourceSemesterId);
        if (!source?.courseIds.includes(courseId)) return prev;

        const semesters = prev.semesters.map((semester) => {
          if (semester.id === sourceSemesterId) {
            return {
              ...semester,
              courseIds: semester.courseIds.filter((id) => id !== courseId),
            };
          }
          return semester;
        });

        return touchPlan({
          ...prev,
          semesters: semesters.map((semester) => {
            if (semester.id !== destSemesterId) return semester;

            const nextIds = [...semester.courseIds];
            const insertAt =
              destIndex !== undefined
                ? Math.min(destIndex, nextIds.length)
                : nextIds.length;
            nextIds.splice(insertAt, 0, courseId);

            return { ...semester, courseIds: nextIds };
          }),
        });
      });
    },
    [setPlan],
  );

  const reorderCourse = useCallback((semesterId: string, courseIds: CourseId[]) => {
    setPlan((prev) =>
      touchPlan({
        ...prev,
        semesters: prev.semesters.map((semester) =>
          semester.id === semesterId ? { ...semester, courseIds } : semester,
        ),
      }),
    );
  }, [setPlan]);

  const markCompleted = useCallback((courseId: CourseId) => {
    setPlan((prev) => {
      if (prev.completedCourseIds.includes(courseId)) return prev;

      return touchPlan({
        ...prev,
        completedCourseIds: [...prev.completedCourseIds, courseId],
        semesters: prev.semesters.map((semester) => ({
          ...semester,
          courseIds: semester.courseIds.filter((id) => id !== courseId),
        })),
      });
    });
  }, [setPlan]);

  const markIncomplete = useCallback((courseId: CourseId) => {
    setPlan((prev) =>
      touchPlan({
        ...prev,
        completedCourseIds: prev.completedCourseIds.filter((id) => id !== courseId),
      }),
    );
  }, [setPlan]);

  const setCurrentSemester = useCallback((semesterId: string | null) => {
    setPlan((prev) => touchPlan({ ...prev, currentSemesterId: semesterId }));
  }, [setPlan]);

  const addSemester = useCallback(() => {
    setPlan((prev) => {
      const last = prev.semesters[prev.semesters.length - 1];
      const nextTerm = getNextTerm(last?.term ?? { season: "Fall", year: 2025 });
      const id = `semester-${Date.now()}`;

      return touchPlan({
        ...prev,
        semesters: [
          ...prev.semesters,
          { id, term: nextTerm, courseIds: [] },
        ],
      });
    });
  }, [setPlan]);

  const getCourseById = useCallback(
    (id: CourseId) => catalog.courses.find((course) => course.id === id),
    [],
  );

  const value = useMemo<PlannerContextValue>(
    () => ({
      courses: catalog.courses,
      degrees: catalog.degrees,
      plan,
      majorId: plan.majorId,
      minorId: plan.minorId,
      selectMajor,
      selectMinor,
      addCourse,
      removeCourse,
      moveCourse,
      reorderCourse,
      markCompleted,
      markIncomplete,
      setCurrentSemester,
      addSemester,
      getCourseById,
    }),
    [
      plan,
      selectMajor,
      selectMinor,
      addCourse,
      removeCourse,
      moveCourse,
      reorderCourse,
      markCompleted,
      markIncomplete,
      setCurrentSemester,
      addSemester,
      getCourseById,
    ],
  );

  return (
    <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
  );
}

function getNextTerm(term: Term): Term {
  const order: Term["season"][] = ["Fall", "Winter", "Spring"];
  const index = order.indexOf(term.season);
  if (index < order.length - 1) {
    return { season: order[index + 1], year: term.year };
  }
  return { season: "Fall", year: term.year + 1 };
}
