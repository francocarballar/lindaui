---
"@lindaui/ui": minor
---

Add opt-in `/compound` HeroUI v3 components and `/compat` controls, presentation, date, and debounce entries for gradual migrations. Add QRCode and `/motion`, `/notifications`, and `/charts`, with their runtime dependencies and Storybook examples. Require `@lindaui/tokens >=0.4.0` for the new styles.

Normalize published declaration references for Node16/NodeNext, preserve React Server Component use of the compatibility barrel with client boundaries only where needed, exclude tests and stories from package output, and add the `default` export condition for Next/webpack resolution.
