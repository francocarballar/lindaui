---
"@lindaui/ui": patch
"@lindaui/blocks": patch
"@lindaui/tokens": patch
---

Document the portable LindaUI consumer skill and its agent-first integration workflow in the shipped package documentation. Add version-aware API inspection, setup plans, theme generation, functional recipes and integration diagnostics, maintained with the library and verified on Windows, macOS and Linux.

Declare stylesheet side-effect types for all token CSS exports so strict TypeScript consumers with noUncheckedSideEffectImports can import @lindaui/tokens/css without a local ambient workaround. Runtime exports remain CSS.
