/** Mixed migration barrel: pure utilities stay callable in Server Components.
 * Interactive components and hooks declare their own client boundaries.
 * Existing flat component entry points remain unchanged. */
export { Button, IconButton } from "./compat-button";
export type { ButtonProps, ButtonColor, ButtonSize, ButtonVariant, IconButtonProps } from "./compat-button";
export { Input, SearchInput } from "./compat-input";
export type { InputProps, InputSize, InputVariant, SearchInputProps } from "./compat-input";
export { Badge, Divider, Spinner } from "./compat-display";
export type { BadgeProps, BadgeColor, BadgeSize, BadgeVariant, DividerProps, SpinnerProps, SpinnerColor, SpinnerSize } from "./compat-display";
export { cn } from "./cn";
export { formatRelativeTime, isToday, isYesterday } from "./compat-date";
export { useDebounce } from "./compat-use-debounce";
