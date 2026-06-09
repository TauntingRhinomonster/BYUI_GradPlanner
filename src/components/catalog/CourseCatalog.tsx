import { useMemo, useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { CourseSearch } from "./CourseSearch";
import { CourseCard } from "../planner/CourseCard";
import { usePlanner } from "../../hooks/usePlanner";
import { getRequiredCourseIds, getUnassignedCourses } from "../../lib/progress";

const CATALOG_DROPPABLE_ID = "catalog";

export function CourseCatalog() {
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

  return (
    <section className="course-catalog">
      <header className="course-catalog-header">
        <div>
          <h2>Course Catalog</h2>
          <p>Required courses for your major/minor appear first.</p>
        </div>
        <CourseSearch query={query} onChange={setQuery} />
      </header>

      <Droppable droppableId={CATALOG_DROPPABLE_ID}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="course-catalog-list"
          >
            {availableCourses.length === 0 && (
              <p className="catalog-empty">No unassigned courses match your search.</p>
            )}

            {availableCourses.map((course, index) => (
              <Draggable key={course.id} draggableId={`catalog:${course.id}`} index={index}>
                {(dragProvided, snapshot) => (
                  <div ref={dragProvided.innerRef} className="catalog-item">
                    <CourseCard
                      code={course.code}
                      title={course.title}
                      credits={course.credits}
                      status="planned"
                      draggableProps={dragProvided.draggableProps}
                      dragHandleProps={dragProvided.dragHandleProps}
                      isDragging={snapshot.isDragging}
                    />
                    <div className="catalog-item-meta">
                      {requiredIds.has(course.id) && (
                        <span className="required-pill">Required</span>
                      )}
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
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </section>
  );
}

export { CATALOG_DROPPABLE_ID };
