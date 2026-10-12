"use client";

import {
  Button,
  Checkbox,
  CheckboxGroup,
  CloseButton,
  InputGroup,
  Popover,
  TextField,
} from "@lindaui/ui/compound";
import { cn } from "@lindaui/ui/cn";
import { Filter, Search, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

export interface FilterOption {
  key: string;
  label: string;
}

export interface SortOption {
  key: string;
  label: string;
}

export interface FilterBarSearchProps {
  className: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

export interface FilterBarIconButtonProps {
  icon: LucideIcon;
  isActive: boolean;
  tooltip: string;
}

export interface FilterBarProps {
  className?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  selectedFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  filterLabel?: string;
  clearFiltersLabel?: string;
  clearSearchLabel?: string;
  sortOptions?: SortOption[];
  selectedSort?: string;
  onSortChange?: (sort: string) => void;
  sortLabel?: string;
  renderSearchInput?: (props: FilterBarSearchProps) => ReactNode;
  renderIconButton?: (props: FilterBarIconButtonProps) => ReactNode;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterOptions,
  selectedFilters = [],
  onFilterChange,
  filterLabel = "Filter",
  clearFiltersLabel = "Clear filters",
  clearSearchLabel = "Clear search",
  sortOptions,
  selectedSort,
  onSortChange,
  sortLabel = "Sort",
  className,
  renderSearchInput,
  renderIconButton = (props) => <FilterIconButton {...props} />,
}: FilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const hasActiveFilters = selectedFilters.length > 0;
  const searchProps = {
    className: "min-w-0 flex-1",
    onChange: onSearchChange,
    placeholder: searchPlaceholder,
    value: searchValue,
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {renderSearchInput ? (
        renderSearchInput(searchProps)
      ) : (
        <FilterSearchInput {...searchProps} clearLabel={clearSearchLabel} />
      )}
      {filterOptions && filterOptions.length > 0 ? (
        <Popover isOpen={isFilterOpen} onOpenChange={setIsFilterOpen}>
          {renderIconButton({ icon: Filter, isActive: hasActiveFilters, tooltip: filterLabel })}
          <Popover.Content className="min-w-[200px] p-4" placement="bottom end">
            <Popover.Dialog className="space-y-3">
              <p className="font-semibold text-sm">{filterLabel}</p>
              <CheckboxGroup
                aria-label={filterLabel}
                onChange={(values) => onFilterChange?.(values)}
                value={selectedFilters}
              >
                {filterOptions.map((option) => (
                  <Checkbox key={option.key} value={option.key}>
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      {option.label}
                    </Checkbox.Content>
                  </Checkbox>
                ))}
              </CheckboxGroup>
              {hasActiveFilters ? (
                <Button
                  className="w-full text-danger"
                  onPress={() => onFilterChange?.([])}
                  size="sm"
                  variant="ghost"
                >
                  {clearFiltersLabel}
                </Button>
              ) : null}
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      ) : null}
      {sortOptions && sortOptions.length > 0 ? (
        <Popover isOpen={isSortOpen} onOpenChange={setIsSortOpen}>
          {renderIconButton({ icon: SlidersHorizontal, isActive: !!selectedSort, tooltip: sortLabel })}
          <Popover.Content className="min-w-[200px] p-4" placement="bottom end">
            <Popover.Dialog className="space-y-3">
              <p className="font-semibold text-sm">{sortLabel}</p>
              <div className="space-y-1">
                {sortOptions.map((option) => (
                  <Button
                    className={cn(
                      "w-full justify-start",
                      selectedSort === option.key && "bg-accent-soft text-accent",
                    )}
                    key={option.key}
                    onPress={() => {
                      onSortChange?.(option.key);
                      setIsSortOpen(false);
                    }}
                    size="sm"
                    variant={selectedSort === option.key ? "tertiary" : "ghost"}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      ) : null}
    </div>
  );
}

function FilterSearchInput({
  value,
  onChange,
  placeholder,
  className,
  clearLabel,
}: FilterBarSearchProps & { clearLabel: string }) {
  return (
    <TextField
      aria-label={placeholder}
      className={cn("w-full min-w-0", className)}
      onChange={onChange}
      value={value}
    >
      <InputGroup>
        <InputGroup.Prefix>
          <Search className="text-muted" size={18} />
        </InputGroup.Prefix>
        <InputGroup.Input className="text-sm" placeholder={placeholder} />
        {value ? (
          <InputGroup.Suffix>
            <CloseButton aria-label={clearLabel} onPress={() => onChange("")} />
          </InputGroup.Suffix>
        ) : null}
      </InputGroup>
    </TextField>
  );
}

function FilterIconButton({ icon: Icon, isActive, tooltip }: FilterBarIconButtonProps) {
  return (
    <Button
      aria-label={tooltip}
      className={cn("border border-border", isActive ? "border-accent" : "")}
      isIconOnly
      size="md"
      variant={isActive ? "tertiary" : "ghost"}
    >
      <Icon size={20} />
    </Button>
  );
}
