import { SemesterColumn } from "./SemesterColumn";
import { Button } from "../common/Button";
import { usePlanner } from "../../hooks/usePlanner";

export function SemesterGrid() {
  const { plan, addSemester } = usePlanner();

  return (
    <section className="planner-board">
      <div className="planner-board-header">
        <div>
          <h2>Semester Plan</h2>
          <p>Drag courses between semesters to reorganize your schedule.</p>
        </div>
        <Button variant="secondary" onClick={addSemester}>
          Add semester
        </Button>
      </div>

      <div className="semester-grid">
        {plan.semesters.map((semester) => (
          <SemesterColumn key={semester.id} semesterId={semester.id} />
        ))}
      </div>
    </section>
  );
}
