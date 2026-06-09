import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { SemesterGrid } from "./SemesterGrid";
import { CourseCatalog, CATALOG_DROPPABLE_ID } from "../catalog/CourseCatalog";
import { usePlanner } from "../../hooks/usePlanner";

function parseCatalogDraggableId(draggableId: string): string | null {
  if (!draggableId.startsWith("catalog:")) return null;
  return draggableId.slice("catalog:".length);
}

export function PlannerWorkspace() {
  const { plan, moveCourse, reorderCourse, addCourse, removeCourse } = usePlanner();

  function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    if (sourceId === CATALOG_DROPPABLE_ID) {
      const courseId = parseCatalogDraggableId(draggableId);
      if (!courseId || destId === CATALOG_DROPPABLE_ID) return;
      addCourse(destId, courseId, destination.index);
      return;
    }

    if (destId === CATALOG_DROPPABLE_ID) {
      const courseId = draggableId;
      removeCourse(sourceId, courseId);
      return;
    }

    if (sourceId === destId) {
      if (source.index === destination.index) return;

      const semester = plan.semesters.find((item) => item.id === sourceId);
      if (!semester) return;

      const nextIds = [...semester.courseIds];
      const [moved] = nextIds.splice(source.index, 1);
      nextIds.splice(destination.index, 0, moved);
      reorderCourse(sourceId, nextIds);
      return;
    }

    moveCourse(sourceId, destId, draggableId, destination.index);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <SemesterGrid />
      <CourseCatalog />
    </DragDropContext>
  );
}
