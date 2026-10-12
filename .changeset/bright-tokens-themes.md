---
"@lindaui/tokens": minor
---

Add `/heroui.css` and `/lead-converter.css` source entries for portable Tailwind pipelines, plus `/lead-converter/compiled.css`, a standalone violet LeadConverter bundle that leaves the default teal `theme.css` unchanged. Include the bundles in the build and its cache inputs while keeping Storybook scanning separate from published CSS.

Isolate temporary CSS inputs and outputs per build, validate complete snapshots before atomic rename, and clean only files owned by that invocation so concurrent builds produce complete, byte-identical artifacts.
