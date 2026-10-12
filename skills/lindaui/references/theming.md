# Styles and themes

Default: import @lindaui/tokens/css once. This is compiled HeroUI styling, teal
canonical tokens and the library's utility classes. It also defines global/root
styling. Preserve existing project styles and inspect their order/cascade.

Override canonical variables after the base: --primary, --primary-foreground,
--ring, --background, --foreground, --card, --border, --radius and other variables
listed by the installed theme-template.css. Do not overwrite --accent, --surface
or --color-* aliases; they reference canonical values. Field-specific overrides
use --field-* when the task requires a field surface customization.

`theme --primary "#2563eb" --primary-dark "#60a5fa"` generates a minimal brand
override, choosing black/white foreground by sRGB contrast. It imports the file
after a tokens/css import in the selected --entry. It refuses an unowned theme
destination. The calculated brand foreground contrast is not a screen-wide
accessibility audit. Use the installed full template for broader customization.

Dark mode uses .dark on an ancestor, typically html. The default use-theme hook
is available through its exported entry; inspect its API and account for SSR
theme initialization and hydration using the framework's existing approach.

## Application Tailwind pipelines

Compiled CSS covers library-used utilities, not every class written in consumer
code. Use existing CSS for new layouts or configure the app's Tailwind pipeline.
For Tailwind 4, use installed tokens/theme.css to expose canonical utility aliases
as appropriate. Follow the installed package's complete stylesheet recipe.
Do not replace a Tailwind 3 pipeline with Tailwind 4 without a requested migration.

Opt-in lead-converter.css is source CSS for a Tailwind 4 pipeline; its @source
locations must be relative to the actual stylesheet and installed packages.
lead-converter/compiled.css is its standalone compiled alternative. heroui.css
is upstream styling for native custom themes. These exports require a version
that actually contains them. Never combine the teal and violet bases or source
and compiled variants. Read the selected package's README/llms.txt before changing
an existing style mode; the automatic setup supports compiled default/violet modes.
