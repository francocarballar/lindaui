---
"@lindaui/blocks": minor
---

Add AppShell and its footer, EntitySwitcher, CommandPalette, ConnectionPanel, ChannelSettings, SettingsLayout, SaveBar, Stepper, KanbanBoard, KanbanColumn, EntityCard, FilterBar, SourceSelector, and StatusFilters. Add independent `/chat`, `/analytics`, and `/compat` namespaces while preserving the existing flat chat entries. Keep the blocks controlled through props and callbacks, with no SDK, persistence, or business logic; keep ScheduleGrid and TimeSlotSelector out of the package.

Normalize published declaration references for Node16/NodeNext, exclude tests and stories from package output, and add the `default` export condition for Next/webpack resolution.
