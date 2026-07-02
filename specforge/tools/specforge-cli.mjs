#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const runtimePath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(runtimePath), "..", "..");
const sourceCliPath = path.join(repoRoot, "src", "cli.ts");

if (!existsSync(sourceCliPath)) {
  console.error("specforge command failed: source CLI is unavailable in this repository runtime.");
  process.exitCode = 2;
} else {
  const child = spawn(
    process.execPath,
    ["--experimental-strip-types", sourceCliPath, ...process.argv.slice(2)],
    { stdio: "inherit" },
  );

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exitCode = code ?? 0;
  });

  child.on("error", (error) => {
    console.error(`specforge command failed: ${error.message}`);
    process.exitCode = 2;
  });
}
