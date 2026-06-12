import type {
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
} from "@hello-pangea/dnd";
import type { CourseStatus } from "../../types";

interface CourseCardProps {
  variant?: "default" | "iplan";
  code: string;
  title: string;
  credits: number;
  status: CourseStatus;
  draggableProps?: DraggableProvidedDraggableProps;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  innerRef?: (element: HTMLElement | null) => void;
  onRemove?: () => void;
  onMarkComplete?: () => void;
  onMarkIncomplete?: () => void;
  isDragging?: boolean;
}

const statusLabels: Record<CourseStatus, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  planned: "Planned",
};

export function CourseCard({
  variant = "default",
  code,
  title,
  credits,
  status,
  draggableProps,
  dragHandleProps,
  innerRef,
  onRemove,
  onMarkComplete,
  onMarkIncomplete,
  isDragging = false,
}: CourseCardProps) {
  if (variant === "iplan") {
    const tone =
      status === "completed"
        ? "completed"
        : status === "in-progress"
          ? "in-progress"
          : "planned";

    return (
      <article
        ref={innerRef}
        className={`course-card-iplan course-card-iplan--${tone} ${isDragging ? "course-card--dragging" : ""}`}
        {...draggableProps}
        {...(dragHandleProps ?? {})}
      >
        <span className="course-card-iplan-edit" aria-hidden="true">
          ✎
        </span>
        <div className="course-card-iplan-body">
          <strong>{code}</strong>
          <span className="course-card-iplan-title">{title}</span>
        </div>
        <span className="course-card-iplan-credits">{credits}</span>
        {(onMarkComplete || onRemove) && (
          <div className="course-card-iplan-actions">
            {status !== "completed" && onMarkComplete && (
              <button type="button" className="iplan-action-btn" onClick={onMarkComplete}>
                Complete
              </button>
            )}
            {onRemove && (
              <button type="button" className="iplan-action-btn" onClick={onRemove}>
                Remove
              </button>
            )}
          </div>
        )}
      </article>
    );
  }

  return (
    <article
      ref={innerRef}
      className={`course-card course-card--${status} ${isDragging ? "course-card--dragging" : ""}`}
      {...draggableProps}
      {...(dragHandleProps ?? {})}
    >
      <div className="course-card-header">
        <strong>{code}</strong>
        <span className="course-card-credits">{credits} cr</span>
      </div>
      <p className="course-card-title">{title}</p>
      <div className="course-card-footer">
        <span className={`course-card-status course-card-status--${status}`}>
          {statusLabels[status]}
        </span>
        <div className="course-card-actions">
          {status !== "completed" && onMarkComplete && (
            <button type="button" className="link-btn" onClick={onMarkComplete}>
              Complete
            </button>
          )}
          {status === "completed" && onMarkIncomplete && (
            <button type="button" className="link-btn" onClick={onMarkIncomplete}>
              Undo
            </button>
          )}
          {onRemove && (
            <button type="button" className="link-btn link-btn-danger" onClick={onRemove}>
              Remove
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
