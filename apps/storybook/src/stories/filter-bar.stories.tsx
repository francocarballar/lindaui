import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FilterBar } from "@lindaui/blocks/filter-bar";

const meta: Meta<typeof FilterBar> = { title: "Blocks/FilterBar", component: FilterBar };
export default meta;
type Story = StoryObj<typeof FilterBar>;
const projects = [{ name: "Accessibility review", stage: "review" }, { name: "Component documentation", stage: "active" }, { name: "Release checklist", stage: "review" }];

function ProjectFilters({ compact = false, searchOnly = false, spanish = false }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [sort, setSort] = useState("");
  const visible = projects.filter((project) => project.name.toLowerCase().includes(search.toLowerCase()) && (!filters.length || filters.includes(project.stage)));
  if (sort) visible.sort((a, b) => sort === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  return <div className={compact ? "w-[340px] max-w-full space-y-4" : "w-[650px] max-w-full space-y-4"}>
    <FilterBar
      searchValue={search} onSearchChange={setSearch}
      searchPlaceholder={spanish ? "Buscar proyectos..." : "Find projects..."}
      filterLabel={spanish ? "Filtrar" : "Filter"} sortLabel={spanish ? "Ordenar" : "Sort"}
      clearFiltersLabel={spanish ? "Limpiar filtros" : "Clear filters"}
      clearSearchLabel={spanish ? "Limpiar búsqueda" : "Clear search"}
      filterOptions={searchOnly ? [] : [{ key: "review", label: spanish ? "Revisión" : "Review" }, { key: "active", label: spanish ? "En progreso" : "In progress" }]}
      selectedFilters={filters} onFilterChange={setFilters}
      sortOptions={searchOnly ? [] : [{ key: "asc", label: "A → Z" }, { key: "desc", label: "Z → A" }]}
      selectedSort={sort} onSortChange={setSort}
    />
    <ul className="divide-y divide-border rounded-xl border border-border px-4">
      {visible.map((project) => <li key={project.name} className="py-3 text-sm">{project.name}</li>)}
    </ul>
    {!visible.length && <p className="text-sm text-muted">{spanish ? "Sin resultados" : "No matching projects"}</p>}
  </div>;
}

export const Interactive: Story = { render: () => <ProjectFilters /> };
export const Compact: Story = { render: () => <ProjectFilters compact /> };
export const SearchOnly: Story = { render: () => <ProjectFilters searchOnly /> };
export const SpanishLabels: Story = { render: () => <ProjectFilters spanish /> };
