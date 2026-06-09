interface CourseSearchProps {
  query: string;
  onChange: (query: string) => void;
}

export function CourseSearch({ query, onChange }: CourseSearchProps) {
  return (
    <input
      type="search"
      className="course-search"
      placeholder="Search by code or title..."
      value={query}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Search courses"
    />
  );
}
