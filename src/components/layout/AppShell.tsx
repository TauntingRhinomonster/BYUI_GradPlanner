import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Header } from "./Header";
import { RequirementsPanel } from "./RequirementsPanel";
import { PlannerWorkspace } from "../planner/PlannerWorkspace";
import { CATALOG_DROPPABLE_ID } from "../catalog/CourseCatalog";
import { usePlanner } from "../../hooks/usePlanner";
import { useDesktopDragDrop } from "../../hooks/useMediaQuery";

function parseCatalogDraggableId(draggableId: string): string | null {
  if (!draggableId.startsWith("catalog:")) return null;
  return draggableId.slice("catalog:".length);
}

function parseSemesterTabId(droppableId: string): string | null {
  if (!droppableId.startsWith("semester-tab-")) return null;
  return droppableId.slice("semester-tab-".length);
}

function resolveSemesterDestId(droppableId: string): string | null {
  return parseSemesterTabId(droppableId) ?? droppableId;
}

function AppBody() {
  const dragEnabled = useDesktopDragDrop();
  const { plan, moveCourse, reorderCourse, addCourse, removeCourse } = usePlanner();

  function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sourceId = source.droppableId;
    const destSemesterId = resolveSemesterDestId(destination.droppableId);
    if (!destSemesterId || destSemesterId === CATALOG_DROPPABLE_ID) {
      if (destination.droppableId === CATALOG_DROPPABLE_ID && sourceId !== CATALOG_DROPPABLE_ID) {
        const sourceSemesterId = parseSemesterTabId(sourceId) ?? sourceId;
        removeCourse(sourceSemesterId, draggableId);
      }
      return;
    }

    if (sourceId === CATALOG_DROPPABLE_ID) {
      const courseId = parseCatalogDraggableId(draggableId);
      if (!courseId) return;
      addCourse(destSemesterId, courseId, destination.index);
      return;
    }

    const sourceSemesterId = parseSemesterTabId(sourceId) ?? sourceId;

    if (sourceSemesterId === destSemesterId) {
      if (source.index === destination.index) return;

      const semester = plan.semesters.find((item) => item.id === sourceSemesterId);
      if (!semester) return;

      const nextIds = [...semester.courseIds];
      const [moved] = nextIds.splice(source.index, 1);
      nextIds.splice(destination.index, 0, moved);
      reorderCourse(sourceSemesterId, nextIds);
      return;
    }

    moveCourse(sourceSemesterId, destSemesterId, draggableId, destination.index);
  }

  const body = (
    <div className="app-body">
      <div className="my-plan-column">
        <PlannerWorkspace />
      </div>
      <RequirementsPanel />
    </div>
  );

  if (!dragEnabled) {
    return body;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {body}
    </DragDropContext>
  );
}

export function AppShell() {
  return (
    <div className="app-shell">
      <Header />
      <AppBody />
    </div>
  );
}
