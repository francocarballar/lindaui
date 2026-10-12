import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { FilterBar } from "./filter-bar";

describe("FilterBar", () => {
  test("emits controlled search/clear callbacks and omits empty filter/sort controls", async () => {
    const onSearchChange = vi.fn();
    render(<FilterBar searchValue="draft" onSearchChange={onSearchChange} searchPlaceholder="Find projects" clearSearchLabel="Reset search" filterOptions={[]} sortOptions={[]} />);
    const input = screen.getByRole("textbox", { name: "Find projects" });
    await userEvent.type(input, "s");
    expect(onSearchChange).toHaveBeenCalledWith("drafts");
    expect(input).toHaveValue("draft");
    await userEvent.click(screen.getByRole("button", { name: "Reset search" }));
    expect(onSearchChange).toHaveBeenCalledWith("");
    expect(screen.queryByRole("button", { name: "Filter" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sort" })).not.toBeInTheDocument();
  });

  test("drives checkbox selection and clear while preserving the filter popover", async () => {
    const onFilterChange = vi.fn();
    function Controlled() {
      const [filters, setFilters] = useState<string[]>([]);
      return <FilterBar searchValue="" onSearchChange={vi.fn()} filterLabel="Stages" clearFiltersLabel="Reset stages"
        filterOptions={[{ key: "review", label: "Review" }]} selectedFilters={filters}
        onFilterChange={(values) => { onFilterChange(values); setFilters(values); }} />;
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole("button", { name: "Stages" }));
    await userEvent.click(await screen.findByRole("checkbox", { name: "Review" }));
    expect(onFilterChange).toHaveBeenCalledWith(["review"]);
    expect(screen.getByRole("checkbox", { name: "Review" })).toBeChecked();
    await userEvent.click(screen.getByRole("button", { name: "Reset stages" }));
    expect(onFilterChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByRole("checkbox", { name: "Review" })).not.toBeChecked();
  });

  test("emits a sort key and closes the sort popover without changing the controlled sort", async () => {
    const onSortChange = vi.fn();
    render(<FilterBar searchValue="" onSearchChange={vi.fn()} sortLabel="Order" selectedSort="oldest" onSortChange={onSortChange}
      sortOptions={[{ key: "oldest", label: "Oldest first" }, { key: "newest", label: "Newest first" }]} />);
    await userEvent.click(screen.getByRole("button", { name: "Order" }));
    expect(await screen.findByRole("button", { name: "Oldest first" })).toHaveClass("bg-accent-soft", "text-accent");
    await userEvent.click(screen.getByRole("button", { name: "Newest first" }));
    expect(onSortChange).toHaveBeenCalledWith("newest");
    await waitFor(() => expect(screen.queryByRole("button", { name: "Newest first" })).not.toBeInTheDocument());
  });

  test("provides original search/trigger props to consumer slots", () => {
    const renderSearchInput = vi.fn(() => <span>Custom search</span>);
    const renderIconButton = vi.fn(({ tooltip }: { tooltip: string }) => <button>{tooltip}</button>);
    render(<FilterBar searchValue="draft" onSearchChange={vi.fn()} renderSearchInput={renderSearchInput} renderIconButton={renderIconButton}
      filterOptions={[{ key: "review", label: "Review" }]} selectedFilters={["review"]} />);
    expect(renderSearchInput).toHaveBeenCalledWith(expect.objectContaining({ className: "min-w-0 flex-1", value: "draft", placeholder: "Search..." }));
    expect(renderIconButton).toHaveBeenCalledWith(expect.objectContaining({ isActive: true, tooltip: "Filter" }));
  });
});
