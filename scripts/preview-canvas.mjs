#!/usr/bin/env node

import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import net from "node:net";
import { spawn, spawnSync } from "node:child_process";

const RUNTIME_VERSION = "1";
const DEFAULT_PORT = 4173;
const HOST = "127.0.0.1";
const scriptDir = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(scriptDir, "..");

function fail(message) {
  console.error(`Canvas Preview: ${message}`);
  process.exit(1);
}

function parseArguments(argv) {
  let canvasPath;
  let port = DEFAULT_PORT;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--port") {
      const value = Number(argv[index + 1]);
      if (!Number.isInteger(value) || value < 1024 || value > 65535) {
        fail("--port must be an integer from 1024 to 65535.");
      }
      port = value;
      index += 1;
      continue;
    }
    if (argument === "--help" || argument === "-h") {
      console.log("Usage: node preview-canvas.mjs <file.canvas.tsx> [--port 4173]");
      process.exit(0);
    }
    if (argument.startsWith("-")) {
      fail(`unknown option ${argument}`);
    }
    if (canvasPath) {
      fail("provide exactly one .canvas.tsx file.");
    }
    canvasPath = argument;
  }

  if (!canvasPath) {
    fail("provide a .canvas.tsx file path.");
  }
  return { canvasPath: resolve(canvasPath), port };
}

function assertCanvasFile(canvasPath) {
  if (!existsSync(canvasPath) || !statSync(canvasPath).isFile()) {
    fail(`file not found: ${canvasPath}`);
  }
  if (!canvasPath.toLowerCase().endsWith(".canvas.tsx")) {
    fail("the input file must end in .canvas.tsx.");
  }

  const source = readFileSync(canvasPath, "utf8");
  const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]);
  const unsupported = imports.filter((value) => value !== "cursor/canvas" && value !== "react");
  if (unsupported.length > 0) {
    fail(`unsupported imports: ${[...new Set(unsupported)].join(", ")}. Canvas previews must be self-contained.`);
  }
}

function canListen(port) {
  return new Promise((resolvePromise) => {
    const server = net.createServer();
    server.unref();
    server.once("error", () => resolvePromise(false));
    server.listen({ host: HOST, port }, () => {
      server.close(() => resolvePromise(true));
    });
  });
}

async function findPort(start) {
  for (let port = start; port < Math.min(start + 40, 65536); port += 1) {
    if (await canListen(port)) return port;
  }
  fail(`no available localhost port found from ${start} to ${start + 39}.`);
}

function ensureDependencies(runtimeRoot) {
  const packageJson = `${JSON.stringify({
    private: true,
    type: "module",
    dependencies: {
      "@vitejs/plugin-react": "6.1.1",
      react: "19.3.0",
      "react-dom": "19.3.0",
      vite: "8.3.1"
    }
  }, null, 2)}\n`;
  const packagePath = join(runtimeRoot, "package.json");
  const markerPath = join(runtimeRoot, `.ready-v${RUNTIME_VERSION}`);
  const packageChanged = !existsSync(packagePath) || readFileSync(packagePath, "utf8") !== packageJson;

  if (packageChanged) {
    writeFileSync(packagePath, packageJson, "utf8");
  }
  if (!packageChanged && existsSync(markerPath) && existsSync(join(runtimeRoot, "node_modules", "vite"))) {
    return;
  }

  console.log("Canvas Preview: installing the pinned local browser runtime (first use only)...");
  const bundledNpmCli = join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
  const npmCommand = existsSync(bundledNpmCli) ? process.execPath : (process.platform === "win32" ? "npm.cmd" : "npm");
  const npmArguments = existsSync(bundledNpmCli) ? [bundledNpmCli, "install", "--no-audit", "--no-fund"] : ["install", "--no-audit", "--no-fund"];
  const result = spawnSync(npmCommand, npmArguments, {
    cwd: runtimeRoot,
    stdio: "inherit",
    shell: !existsSync(bundledNpmCli) && process.platform === "win32"
  });
  if (result.status !== 0) {
    fail("npm install failed. Check network access and the npm configuration, then retry.");
  }
  writeFileSync(markerPath, new Date().toISOString(), "utf8");
}

function writePreviewProject(canvasPath, runtimeRoot) {
  const id = createHash("sha256").update(canvasPath).digest("hex").slice(0, 12);
  const sessionRoot = join(runtimeRoot, "sessions", id);
  const srcRoot = join(sessionRoot, "src");
  mkdirSync(srcRoot, { recursive: true });

  const canvasCopy = join(srcRoot, "Canvas.tsx");
  const runtimeAssetRoot = join(pluginRoot, "assets", "runtime");
  copyFileSync(canvasPath, canvasCopy);
  copyFileSync(join(runtimeAssetRoot, "cursor-canvas.tsx"), join(srcRoot, "cursor-canvas.tsx"));
  copyFileSync(join(runtimeAssetRoot, "preview.css"), join(srcRoot, "preview.css"));
  copyFileSync(join(runtimeAssetRoot, "index.html"), join(sessionRoot, "index.html"));

  const displayName = basename(canvasPath);
  writeFileSync(join(srcRoot, "main.tsx"), `
import React from "react";
import { createRoot } from "react-dom/client";
import Canvas from "./Canvas";
import "./preview.css";

const sourcePath = ${JSON.stringify(canvasPath)};
const displayName = ${JSON.stringify(displayName)};

class PreviewErrorBoundary extends React.Component<React.PropsWithChildren, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return <main className="preview-error"><p className="preview-kicker">Canvas runtime error</p><h1>{this.state.error.message}</h1><pre>{this.state.error.stack}</pre></main>;
  }
}

function PreviewShell() {
  const initialTheme = localStorage.getItem("codex-canvas-preview:theme") || "dark";
  const [theme, setTheme] = React.useState(initialTheme);
  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("codex-canvas-preview:theme", theme);
    window.dispatchEvent(new CustomEvent("canvas-theme-change", { detail: theme }));
  }, [theme]);
  return <>
    <header className="preview-toolbar">
      <div className="preview-file"><span className="preview-dot" /><strong>{displayName}</strong><span title={sourcePath}>{sourcePath}</span></div>
      <div className="preview-actions">
        <button type="button" onClick={() => navigator.clipboard?.writeText(sourcePath)}>Copy path</button>
        <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "Light" : "Dark"}</button>
        <button type="button" onClick={() => location.reload()}>Reload</button>
      </div>
    </header>
    <div className="preview-canvas"><PreviewErrorBoundary><Canvas /></PreviewErrorBoundary></div>
  </>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><PreviewShell /></React.StrictMode>);
`, "utf8");

  writeFileSync(join(sessionRoot, "vite.config.mjs"), `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [react()],
  resolve: { alias: { "cursor/canvas": fileURLToPath(new URL("./src/cursor-canvas.tsx", import.meta.url)) } },
  server: { host: ${JSON.stringify(HOST)}, strictPort: true }
});
`, "utf8");

  return { canvasCopy, sessionRoot };
}

const { canvasPath, port: requestedPort } = parseArguments(process.argv.slice(2));
assertCanvasFile(canvasPath);

const runtimeRoot = join(homedir(), ".codex", "canvas-preview", `runtime-v${RUNTIME_VERSION}`);
mkdirSync(runtimeRoot, { recursive: true });
ensureDependencies(runtimeRoot);
const { canvasCopy, sessionRoot } = writePreviewProject(canvasPath, runtimeRoot);
const port = await findPort(requestedPort);
const url = `http://${HOST}:${port}/`;

console.log(`Canvas Preview: ${canvasPath}`);
console.log(`CANVAS_PREVIEW_URL=${url}`);
console.log("Canvas Preview: watching the source file; press Ctrl+C to stop.");

let lastModified = statSync(canvasPath).mtimeMs;
const watcher = setInterval(() => {
  try {
    const modified = statSync(canvasPath).mtimeMs;
    if (modified !== lastModified) {
      copyFileSync(canvasPath, canvasCopy);
      lastModified = modified;
      console.log(`Canvas Preview: refreshed ${basename(canvasPath)}`);
    }
  } catch (error) {
    console.error(`Canvas Preview: source watch failed: ${error.message}`);
  }
}, 500);

const viteBin = join(runtimeRoot, "node_modules", "vite", "bin", "vite.js");
const child = spawn(process.execPath, [viteBin, "--config", join(sessionRoot, "vite.config.mjs"), "--port", String(port)], {
  cwd: sessionRoot,
  stdio: "inherit",
  env: { ...process.env, BROWSER: "none" }
});

function shutdown(signal) {
  clearInterval(watcher);
  if (!child.killed) child.kill(signal);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
child.on("exit", (code) => {
  clearInterval(watcher);
  process.exit(code ?? 0);
});
