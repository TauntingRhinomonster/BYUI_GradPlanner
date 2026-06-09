import { useMemo } from "react";
import { getDegreeById } from "../lib/dataLoader";
import { calculateDegreeProgress } from "../lib/progress";
import type { DegreeProgressSummary } from "../types";
import { usePlanner } from "./usePlanner";

export function useDegreeProgress(): {
  majorProgress: DegreeProgressSummary | null;
  minorProgress: DegreeProgressSummary | null;
} {
  const { courses, degrees, majorId, minorId, plan } = usePlanner();

  const majorProgress = useMemo(
    () => calculateDegreeProgress(getDegreeById(degrees, majorId), courses, plan),
    [courses, degrees, majorId, plan],
  );

  const minorProgress = useMemo(
    () => calculateDegreeProgress(getDegreeById(degrees, minorId), courses, plan),
    [courses, degrees, minorId, plan],
  );

  return { majorProgress, minorProgress };
}
