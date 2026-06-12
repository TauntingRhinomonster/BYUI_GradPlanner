import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "../common/Button";
import { CourseCard } from "./CourseCard";
import { usePlanner } from "../../hooks/usePlanner";
import { getCourseStatus, isSemesterPast } from "../../lib/progress";
import { formatTerm } from "../../types";

interface SemesterCarouselProps {
  selectedSemesterId: string;
  onSelectSemester: (semesterId: string) => void;
  dragEnabled?: boolean;
}

export function SemesterCarousel({
  selectedSemesterId,
  onSelectSemester,
  dragEnabled = true,
}: SemesterCarouselProps) {
  const { plan, getCourseById } = usePlanner();

  return (
    <div className="semester-carousel">
      {plan.semesters.map((semester) => {
        const isSelected = semester.id === selectedSemesterId;
        const isPast = isSemesterPast(semester, plan);
        const totalCredits = semester.courseIds.reduce(
          (sum, id) => sum + (getCourseById(id)?.credits ?? 0),
          0,
        );

        const card = (
          <button
            type="button"
            className={`semester-carousel-card ${isSelected ? "semester-carousel-card--selected" : ""}`}
            onClick={() => onSelectSemester(semester.id)}
          >
            <span className="semester-carousel-label">{formatTerm(semester.term)}</span>
            <div className="semester-carousel-bars" aria-hidden="true">
              {semester.courseIds.length === 0 ? (
                <span className="semester-carousel-bar semester-carousel-bar--empty" />
              ) : (
                semester.courseIds.map((courseId) => (
                  <span
                    key={courseId}
                    className={`semester-carousel-bar ${isPast ? "semester-carousel-bar--completed" : "semester-carousel-bar--planned"}`}
                  />
                ))
              )}
            </div>
            <span className="semester-carousel-credits">{totalCredits} cr</span>
          </button>
        );

        if (!dragEnabled) {
          return <div key={semester.id}>{card}</div>;
        }

        return (
          <Droppable key={semester.id} droppableId={`semester-tab-${semester.id}`}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`semester-carousel-wrap ${snapshot.isDraggingOver ? "semester-carousel-wrap--drop-target" : ""}`}
              >
                <button
                  type="button"
                  className={`semester-carousel-card ${isSelected ? "semester-carousel-card--selected" : ""}`}
                  onClick={() => onSelectSemester(semester.id)}
                >
                  <span className="semester-carousel-label">{formatTerm(semester.term)}</span>
                  <div className="semester-carousel-bars" aria-hidden="true">
                    {semester.courseIds.length === 0 ? (
                      <span className="semester-carousel-bar semester-carousel-bar--empty" />
                    ) : (
                      semester.courseIds.map((courseId) => (
                        <span
                          key={courseId}
                          className={`semester-carousel-bar ${isPast ? "semester-carousel-bar--completed" : "semester-carousel-bar--planned"}`}
                        />
                      ))
                    )}
                  </div>
                  <span className="semester-carousel-credits">{totalCredits} cr</span>
                </button>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        );
      })}
    </div>
  );
}

interface ActiveSemesterListProps {
  semesterId: string;
  dragEnabled?: boolean;
}

export function ActiveSemesterList({
  semesterId,
  dragEnabled = true,
}: ActiveSemesterListProps) {
  const { plan, getCourseById, removeCourse, markCompleted, setCurrentSemester } =
    usePlanner();

  const semester = plan.semesters.find((item) => item.id === semesterId);
  if (!semester) return null;

  const isCurrent = plan.currentSemesterId === semesterId;

  return (
    <section className="active-semester">
      <header className="active-semester-header">
        <div>
          <h3>{formatTerm(semester.term)}</h3>
          <p>{semester.courseIds.length} courses scheduled</p>
        </div>
        <button
          type="button"
          className={`current-badge ${isCurrent ? "current-badge--active" : ""}`}
          onClick={() => setCurrentSemester(isCurrent ? null : semesterId)}
        >
          {isCurrent ? "Current Semester" : "Set as current"}
        </button>
      </header>

      <Droppable droppableId={semesterId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`active-semester-list ${snapshot.isDraggingOver ? "active-semester-list--active" : ""}`}
          >
            {semester.courseIds.length === 0 && (
              <p className="semester-empty">Drag courses here or add from the catalog.</p>
            )}

            {semester.courseIds.map((courseId, index) => {
              const course = getCourseById(courseId);
              if (!course) return null;

              const status = getCourseStatus(courseId, plan, semesterId);

              const card = (
                <CourseCard
                  variant="iplan"
                  code={course.code}
                  title={course.title}
                  credits={course.credits}
                  status={status}
                  onRemove={() => removeCourse(semesterId, courseId)}
                  onMarkComplete={() => markCompleted(courseId)}
                />
              );

              if (!dragEnabled) {
                return <div key={courseId}>{card}</div>;
              }

              return (
                <Draggable key={courseId} draggableId={courseId} index={index}>
                  {(dragProvided, dragSnapshot) => (
                    <CourseCard
                      variant="iplan"
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

interface SemesterPlannerProps {
  selectedSemesterId: string;
  onSelectSemester: (semesterId: string) => void;
  dragEnabled?: boolean;
}

export function SemesterPlanner({
  selectedSemesterId,
  onSelectSemester,
  dragEnabled = true,
}: SemesterPlannerProps) {
  const { addSemester } = usePlanner();

  return (
    <section className="planner-board">
      <div className="planner-board-header">
        <h2>My Plan</h2>
        <Button variant="secondary" onClick={addSemester}>
          Add semester
        </Button>
      </div>

      <SemesterCarousel
        selectedSemesterId={selectedSemesterId}
        onSelectSemester={onSelectSemester}
        dragEnabled={dragEnabled}
      />
      <ActiveSemesterList semesterId={selectedSemesterId} dragEnabled={dragEnabled} />
    </section>
  );
}
