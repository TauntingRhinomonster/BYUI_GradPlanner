import { Droppable, Draggable } from "@hello-pangea/dnd";
import { CourseCard } from "./CourseCard";
import { usePlanner } from "../../hooks/usePlanner";
import { getCourseStatus } from "../../lib/progress";
import { formatTerm } from "../../types";

interface SemesterColumnProps {
  semesterId: string;
}

export function SemesterColumn({ semesterId }: SemesterColumnProps) {
  const {
    plan,
    getCourseById,
    removeCourse,
    markCompleted,
    setCurrentSemester,
  } = usePlanner();

  const semester = plan.semesters.find((item) => item.id === semesterId);
  if (!semester) return null;

  const isCurrent = plan.currentSemesterId === semesterId;
  const totalCredits = semester.courseIds.reduce(
    (sum, id) => sum + (getCourseById(id)?.credits ?? 0),
    0,
  );

  return (
    <section className={`semester-column ${isCurrent ? "semester-column--current" : ""}`}>
      <header className="semester-column-header">
        <div>
          <h3>{formatTerm(semester.term)}</h3>
          <p>{totalCredits} credits</p>
        </div>
        <button
          type="button"
          className={`current-badge ${isCurrent ? "current-badge--active" : ""}`}
          onClick={() => setCurrentSemester(isCurrent ? null : semesterId)}
        >
          {isCurrent ? "Current" : "Set current"}
        </button>
      </header>

      <Droppable droppableId={semesterId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`semester-dropzone ${snapshot.isDraggingOver ? "semester-dropzone--active" : ""}`}
          >
            {semester.courseIds.length === 0 && (
              <p className="semester-empty">Drag courses here</p>
            )}

            {semester.courseIds.map((courseId, index) => {
              const course = getCourseById(courseId);
              if (!course) return null;

              const status = getCourseStatus(courseId, plan, semesterId);

              return (
                <Draggable key={courseId} draggableId={courseId} index={index}>
                  {(dragProvided, dragSnapshot) => (
                    <CourseCard
                      code={course.code}
                      title={course.title}
                      credits={course.credits}
                      status={status}
                      innerRef={dragProvided.innerRef}
                      draggableProps={dragProvided.draggableProps}
                      dragHandleProps={dragProvided.dragHandleProps}
                      isDragging={dragSnapshot.isDragging}
                      onRemove={() => removeCourse(semesterId, courseId)}
                      onMarkComplete={() => markCompleted(courseId)}
                    />
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </section>
  );
}
