# Overlays and collections

## Confirmation

Flat Dialog is controlled through open/onClose and needs title. The confirmation
recipe receives open/onClose/onConfirm, waits for asynchronous completion before
closing, disables actions while pending, and displays a rejection for retry.
Adapt dismiss behavior, labels and destructive styling to the task. Existing
blocks/confirm-dialog is another option; its onConfirm contract differs.
Verify Escape, focus return, keyboard navigation and pending/error behavior.

## Lists and tables

ListPane and TablePane own presentation, not data fetching/filtering. Supply
searchValue/onSearchChange, visible data, loading/error/isEmpty and onRetry.
The searchable-list and data-table recipes actually filter supplied data with
the installed matchesSearch utility. They retain loading/error/empty states and
expose retry. Keep remote fetching, pagination and business filters in the app.

List item keys use app IDs. The current flat Table generates positional IDs
internally; do not claim reorder-safe selection behavior that it does not expose.
TablePane delegates to that flat implementation. Select an exported richer
composition when required and inspect its actual controlled selection API.

Use stable accessible names and semantic collection roles. Inspect the rendered
DOM rather than assuming a native table role. Verify filter results, no matches,
loading, failure/retry and a populated state.
