# Grad Planner — Front-End Construction Plan

A browser-only React + TypeScript app for planning future courses toward on-time graduation. No back-end: user data persists in `localStorage`, and course/degree catalogs are served from static mock JSON files.

---

## 1. Directory Structure

```text
src/
├── assets/
│   └── data/                  # static mock JSON (committed catalogs)
│       ├── courses.json
│       └── degrees.json
├── components/
│   ├── layout/                # AppShell, Header, Sidebar
│   ├── planner/               # SemesterGrid, SemesterColumn, CourseCard
│   ├── catalog/               # CourseCatalog, CourseSearch
│   ├── requirements/          # RequirementGroup, ProgressBar
│   └── common/                # Button, Modal, Select (reusable primitives)
├── context/
│   └── PlannerContext.tsx     # global planner state provider
├── hooks/
│   ├── useLocalStorage.ts     # generic persisted state hook
│   ├── usePlanner.ts          # consumes PlannerContext
│   └── useDegreeProgress.ts   # derives progress from plan + requirements
├── lib/
│   ├── storage.ts             # typed localStorage read/write helpers
│   ├── dataLoader.ts          # loads & validates static JSON
│   └── progress.ts            # pure functions for progress calculation
├── types/
│   └── index.ts               # shared TypeScript interfaces
├── App.tsx
└── main.tsx
```

---

## 2. Component Hierarchy

- **`App`** — Root; mounts providers and the layout shell.
  - **`PlannerProvider`** — Wraps the tree with global planner state (see §3).
  - **`AppShell`** — Page frame holding header, sidebar, and main content.
    - **`Header`** — Degree selector and overall graduation status summary.
    - **`Sidebar`** — Requirement overview and quick navigation.
      - **`RequirementGroup`** — One degree requirement category (e.g., "Core", "Electives"); shows fulfilled vs. remaining.
      - **`ProgressBar`** — Visual credit/requirement completion indicator.
    - **`PlannerBoard`** — Main planning surface; arranges semesters left-to-right.
      - **`SemesterColumn`** — A single term (e.g., "Fall 2026") containing planned courses.
        - **`CourseCard`** — A planned course; shows code, title, credits; supports remove/move.
    - **`CourseCatalog`** — Browsable/searchable list of available courses.
      - **`CourseSearch`** — Filters catalog by code, title, or requirement.
      - **`CourseCard`** — Reused as a draggable/addable catalog entry.
  - **`common/`** — `Button`, `Modal`, `Select`, etc., used throughout.

---

## 3. State Management

Use **React Context + hooks** (no external library needed for this scope).

- A single **`PlannerContext`** holds the app's mutable state: `selectedDegreeId`, `plan` (semesters → course IDs), and UI flags.
- **`usePlanner()`** exposes typed actions: `addCourse`, `removeCourse`, `moveCourse`, `addSemester`, `selectDegree`.
- **Persistence** is automatic via **`useLocalStorage`**, which syncs the planner state to `localStorage` on every change and rehydrates it on load. This keeps persistence orthogonal to component logic.
- **Derived state** (progress, remaining requirements, conflicts) is *computed*, never stored. **`useDegreeProgress()`** recalculates from `plan` + loaded degree requirements using pure functions in `lib/progress.ts`, avoiding stale/duplicated state.

> If state complexity grows (undo/redo, many cross-cutting actions), migrate the context's reducer to **Zustand** with minimal component changes since access is already centralized behind hooks.

---

## 4. Data Models

```typescript
// src/types/index.ts

export type CourseId = string; // e.g., "CSE 210"

export interface Course {
  id: CourseId;
  code: string;        // "CSE 210"
  title: string;       // "Programming with Classes"
  credits: number;
  prerequisites: CourseId[];
  offeredTerms: Term[]; // terms the course is typically offered
}

export type Season = "Fall" | "Winter" | "Spring";

export interface Term {
  season: Season;
  year: number;        // e.g., 2026
}

export interface RequirementGroup {
  id: string;
  name: string;            // "Major Core", "General Education"
  requiredCredits: number;
  courseOptions: CourseId[]; // courses that satisfy this group
}

export interface Degree {
  id: string;
  name: string;            // "BS Software Engineering"
  totalCreditsRequired: number;
  requirements: RequirementGroup[];
}

export interface PlannedSemester {
  id: string;
  term: Term;
  courseIds: CourseId[];
}

export interface DegreePlan {
  degreeId: string;
  semesters: PlannedSemester[];
  updatedAt: string;       // ISO timestamp
}
```
