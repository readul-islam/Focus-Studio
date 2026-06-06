import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { platform } from "node:os";

const serverDir = join(process.cwd(), "server");
const isWindows = platform() === "win32";
const venvPython = isWindows
  ? join(serverDir, ".venv", "Scripts", "python.exe")
  : join(serverDir, ".venv", "bin", "python");

const python = existsSync(venvPython) ? venvPython : "python";

const child = spawn(python, ["manage.py", "runserver"], {
  cwd: serverDir,
  stdio: "inherit",
  windowsHide: true,
});

child.on("error", (err) => {
  console.error("[api] Failed to start Django server:", err.message);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
