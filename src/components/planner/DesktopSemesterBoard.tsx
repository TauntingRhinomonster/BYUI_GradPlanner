import { Button } from "../common/Button";
import { SemesterColumn } from "./SemesterColumn";
import { usePlanner } from "../../hooks/usePlanner";

export function DesktopSemesterBoard() {
  const { plan, addSemester } = usePlanner();

  return (
    <section className="planner-board">
      <div className="planner-board-header">
        <div>
          <h2>My Plan</h2>
          <p className="planner-board-hint">
            Drag courses between semesters or from the catalog on the right.
          </p>
        </div>
        <Button variant="secondary" onClick={addSemester}>
          Add semester
        </Button>
      </div>

      <div className="semester-board-grid">
        {plan.semesters.map((semester) => (
          <SemesterColumn key={semester.id} semesterId={semester.id} variant="iplan" />
        ))}
      </div>
    </section>
  );
}
