import { useState } from "react";
import { DesktopSemesterBoard } from "./DesktopSemesterBoard";
import { SemesterPlanner } from "./SemesterPlanner";
import { usePlanner } from "../../hooks/usePlanner";
import { useDesktopDragDrop } from "../../hooks/useMediaQuery";

export function PlannerWorkspace() {
  const dragEnabled = useDesktopDragDrop();
  const { plan } = usePlanner();
  const [selectedSemesterId, setSelectedSemesterId] = useState(
    () => plan.currentSemesterId ?? plan.semesters[0]?.id ?? "",
  );

  if (dragEnabled) {
    return <DesktopSemesterBoard />;
  }

  return (
    <SemesterPlanner
      selectedSemesterId={selectedSemesterId}
      onSelectSemester={setSelectedSemesterId}
      dragEnabled={false}
    />
  );
}