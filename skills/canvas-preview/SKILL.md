---
name: canvas-preview
description: Preview, render, or troubleshoot Cursor-style `.canvas.tsx` artifacts inside Codex by running a local compatibility viewer. Use when the user asks to open a Canvas file visually, see it beside the chat, or diagnose its rendering. Do not use for ordinary React/TSX applications.
---

# Canvas Preview

Render the requested `.canvas.tsx` without changing its source file.

1. Resolve the exact Canvas path. If the user did not name one, search the current workspace for `*.canvas.tsx`; use the only match, or ask when several plausible files remain.
2. Start the viewer as a long-running process:

   ```text
   node <plugin-root>/scripts/preview-canvas.mjs <absolute-canvas-path>
   ```

   Resolve `<plugin-root>` from this skill's installed location (`../..`). Quote Windows paths. The command installs its pinned browser runtime on first use, prints `CANVAS_PREVIEW_URL=...`, and watches the original file for changes.
3. Open the printed URL in the Codex browser panel with `open_in_codex` when available. Otherwise, open it in the available local browser preview. Keep the server process alive while the user is viewing the Canvas.
4. Verify that the rendered Canvas is visible. Check the server output and browser console when compilation or runtime errors appear.

The compatibility runtime implements the public `cursor/canvas` components, charts, forms, theme tokens, `useCanvasState`, and common utilities. State is stored in browser local storage. Cursor host actions such as `openAgent`, `newComposerChat`, and `openFile` are surfaced as unsupported in the preview because a browser cannot dispatch them to Cursor.

Treat failures according to their source:

- Fix the viewer when the compatibility runtime is missing an exported `cursor/canvas` API.
- Fix the Canvas source only when the user asked to repair it.
- Explain unsupported relative imports or external packages instead of silently rewriting the artifact.
- Bind only to `127.0.0.1`; do not expose the preview server to the network.
