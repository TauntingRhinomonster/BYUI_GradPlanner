import { useMemo, useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { CourseSearch } from "./CourseSearch";
import { CourseCard } from "../planner/CourseCard";
import { usePlanner } from "../../hooks/usePlanner";
import { useDesktopDragDrop } from "../../hooks/useMediaQuery";
import { getRequiredCourseIds, getUnassignedCourses } from "../../lib/progress";

const CATALOG_DROPPABLE_ID = "catalog";

export function CourseCatalog() {
  const dragEnabled = useDesktopDragDrop();
  const { courses, degrees, plan, majorId, minorId, addCourse, markCompleted } =
    usePlanner();
  const [query, setQuery] = useState("");

  const requiredIds = useMemo(
    () => new Set(getRequiredCourseIds(degrees, majorId, minorId)),
    [degrees, majorId, minorId],
  );

  const availableCourses = useMemo(() => {
    const unassigned = getUnassignedCourses(courses, plan);
    const filtered = unassigned.filter((course) => {
      const haystack = `${course.code} ${course.title}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });

    return filtered.sort((a, b) => {
      const aRequired = requiredIds.has(a.id) ? 0 : 1;
      const bRequired = requiredIds.has(b.id) ? 0 : 1;
      if (aRequired !== bRequired) return aRequired - bRequired;
      return a.code.localeCompare(b.code);
    });
  }, [courses, plan, query, requiredIds]);

  function handleAddToCurrent(courseId: string) {
    const target =
      plan.currentSemesterId ??
      plan.semesters.find((semester) => semester.courseIds.length === 0)?.id ??
      plan.semesters[0]?.id;

    if (target) {
      addCourse(target, courseId);
    }
  }

  function renderCatalogItem(course: (typeof availableCourses)[number], index: number) {
    const meta = (
      <div className="catalog-item-meta">
        {requiredIds.has(course.id) && (
          <span className="required-pill">Required</span>
        )}
        {dragEnabled && <span className="catalog-drag-hint">Drag to a semester</span>}
        <button
          type="button"
          className="link-btn"
          onClick={() => handleAddToCurrent(course.id)}
        >
          Add to plan
        </button>
        <button
          type="button"
          className="link-btn"
          onClick={() => markCompleted(course.id)}
        >
          Mark completed
        </button>
      </div>
    );

    if (!dragEnabled) {
      return (
        <div key={course.id} className="catalog-item">
          <CourseCard
            code={course.code}
            title={course.title}
            credits={course.credits}
            status="planned"
          />
          {meta}
        </div>
      );
    }

    return (
      <Draggable key={course.id} draggableId={`catalog:${course.id}`} index={index}>
        {(dragProvided, snapshot) => (
          <div
            ref={dragProvided.innerRef}
            {...dragProvided.draggableProps}
            {...dragProvided.dragHandleProps}
            className={`catalog-item catalog-item--draggable ${snapshot.isDragging ? "catalog-item--dragging" : ""}`}
          >
            <CourseCard
              code={course.code}
              title={course.title}
              credits={course.credits}
              status="planned"
              isDragging={snapshot.isDragging}
            />
            {meta}
          </div>
        )}
      </Draggable>
    );
  }

  const listContent = (
    <>
      {availableCourses.length === 0 && (
        <p className="catalog-empty">No unassigned courses match your search.</p>
      )}
      {availableCourses.map((course, index) => renderCatalogItem(course, index))}
    </>
  );

  return (
    <section className="course-catalog">
      <header className="course-catalog-header">
        <div>
          <h2>Course Catalog</h2>
          <p>
            {dragEnabled
              ? "Drag courses into a semester column, or use Add to plan."
              : "Required courses for your major/minor appear first."}
          </p>
        </div>
        <CourseSearch query={query} onChange={setQuery} />
      </header>

      {dragEnabled ? (
        <Droppable droppableId={CATALOG_DROPPABLE_ID}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="course-catalog-list"
            >
              {listContent}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ) : (
        <div className="course-catalog-list">{listContent}</div>
      )}
    </section>
  );
}

export { CATALOG_DROPPABLE_ID };
