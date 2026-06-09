import type { ReactNode } from "react";

interface CollapsibleSidebarSectionProps {
  panelId: string;
  title: string;
  badge?: string | number;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}

export function CollapsibleSidebarSection({
  panelId,
  title,
  badge,
  expanded,
  onToggle,
  children,
  className = "",
}: CollapsibleSidebarSectionProps) {
  return (
    <section className={`sidebar-section sidebar-collapsible ${className}`.trim()}>
      <button
        type="button"
        className="sidebar-collapsible-toggle"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <span className="sidebar-collapsible-heading">
          <h2>{title}</h2>
          {badge !== undefined && badge !== "" && (
            <span className="sidebar-collapsible-badge">{badge}</span>
          )}
        </span>
        <span className="sidebar-collapsible-chevron" aria-hidden="true">
          {expanded ? "▾" : "▸"}
        </span>
      </button>
      <div
        id={panelId}
        className={`sidebar-collapsible-panel ${expanded ? "sidebar-collapsible-panel--expanded" : "sidebar-collapsible-panel--collapsed"}`}
      >
        {children}
      </div>
    </section>
  );
}
