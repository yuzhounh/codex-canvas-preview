# Codex Canvas Preview

[![License: MIT](https://img.shields.io/badge/License-MIT-D4A017.svg)](LICENSE)

Preview Cursor-style `.canvas.tsx` artifacts inside Codex using a local React/Vite compatibility runtime.

Codex can generate Canvas files that import `cursor/canvas`, but those files normally open as source code outside Cursor's native Canvas host. This plugin adds a repeatable workflow that:

1. resolves the requested `.canvas.tsx` file;
2. starts an isolated local preview server on `127.0.0.1`;
3. maps `cursor/canvas` to the bundled compatibility runtime; and
4. opens the rendered Canvas in the Codex browser panel.

The original Canvas file is never modified. The preview watches it for changes and refreshes automatically.

## Supported Canvas APIs

- Layout: `Stack`, `Row`, `Grid`, `Spacer`, `Divider`
- Typography and surfaces: headings, text, links, code, cards, callouts, pills, stats, tables
- Forms: text inputs, text areas, checkboxes, toggles, selects, icon buttons
- Charts: bar, line, pie, and donut charts
- Utilities: usage bars, swatches, collapsible sections, todo lists, diffs, and DAG layout
- Hooks: `useHostTheme`, `useCanvasState`, and `useCanvasAction`

`useCanvasState` persists values in browser local storage. Cursor-only host actions such as `openAgent`, `newComposerChat`, and `openFile` display an explanatory message because a browser preview cannot dispatch actions to Cursor.

## Requirements

- Codex desktop app or Codex CLI
- Node.js 20 or newer
- npm access on the first preview run

The first run installs pinned React and Vite dependencies under `~/.codex/canvas-preview/`. Later previews reuse that runtime.

## Install as a personal plugin

Clone the repository into your personal plugin source directory:

```powershell
git clone https://github.com/yuzhounh/codex-canvas-preview.git "$HOME\plugins\codex-canvas-preview"
```

Add this entry to the `plugins` array in `~/.agents/plugins/marketplace.json`:

```json
{
  "name": "codex-canvas-preview",
  "source": {
    "source": "local",
    "path": "C:/Users/YOUR_USERNAME/plugins/codex-canvas-preview"
  },
  "policy": {
    "installation": "AVAILABLE",
    "authentication": "ON_INSTALL"
  },
  "category": "Productivity"
}
```

Replace the example `path` with the absolute path to your clone; the clone command above places it under `$HOME\plugins\codex-canvas-preview`. JSON paths can use forward slashes as shown.

Then install it:

```powershell
codex plugin add codex-canvas-preview@personal
```

Start a new Codex task and ask:

```text
Preview this .canvas.tsx file in Codex.
```

## Run the viewer directly

Run the command from the cloned repository directory, replacing the example Canvas path with your file:

```powershell
node scripts/preview-canvas.mjs "C:\path\to\example.canvas.tsx"
```

The command prints `CANVAS_PREVIEW_URL=http://127.0.0.1:<port>/`. It selects another local port automatically if the default port is busy.

Open that URL in the Codex browser panel or your browser. Keep the terminal running while previewing, and press `Ctrl+C` to stop the server. Use `--port 4174` to request a different starting port.

## Security model

- The development server binds only to `127.0.0.1`.
- The preview page blocks external scripts, images, objects, and network connections with a Content Security Policy.
- Supported Canvas imports are `cursor/canvas` and React. Import validation is a compatibility check and does not provide complete isolation for untrusted code.
- Source files are copied into an isolated runtime directory before compilation.

Canvas code executes in a local development runtime. Only preview files you trust.

## Compatibility

The bundled runtime follows the public `cursor/canvas` component surface available when this project was created. Visual details may differ slightly from Cursor's native renderer. If Cursor adds a new export, add the matching implementation in `assets/runtime/cursor-canvas.tsx`.

## License

This project is licensed under the [MIT License](LICENSE).
