# Framework integration

## Vite / ordinary React

Import the base CSS in the actual application entry, commonly src/main.tsx or
src/main.jsx. Preserve existing CSS imports and application setup. Compiled tokens
need no Tailwind build plugin. Use your existing pipeline for application classes.

## Next App Router

Load global base CSS in the root layout or its global stylesheet. Do not add
"use client" to the entire layout merely to use LindaUI. Put state, event handlers
and hooks in a client component with "use client" at its top. Server components
can import client components, but cannot pass arbitrary nonserializable callbacks
across the server/client boundary. Keep callback logic in the client or follow the
project's existing server-action pattern.

## Next Pages Router

Load global CSS through pages/_app or src/pages/_app. This is a separate integration
recipe from App Router. Do not create an App Router directory to install a library.

## Monorepos and other setups

Select the application package with --project. Peer resolution and installation
belong to that package, even if dependencies are hoisted. An ambiguous root stops
automatic setup. Explicit --entry supports custom React entrypoints.

The automatic source scanner uses the filesystem, does not follow source symlinks,
and reports parse errors and scan limits. It cannot prove webpack/Vite alias
reachability, all CSS configuration or authenticated runtime behavior.
Generic React frameworks, custom bundlers and PnP require their own integration
verification. React Native and non-React renderers are outside the current library
contract. Do not claim a framework matrix passed without executing it.
