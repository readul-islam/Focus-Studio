import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { platform } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const serverDir = join(rootDir, 'server');
const isWindows = platform() === 'win32';
const venvPython = isWindows
  ? join(serverDir, '.venv', 'Scripts', 'python.exe')
  : join(serverDir, '.venv', 'bin', 'python');

const python = existsSync(venvPython) ? venvPython : 'python3';

// Bind all interfaces so phones on the same LAN can reach the API during dev.
const child = spawn(python, ['manage.py', 'runserver', '0.0.0.0:8000'], {
  cwd: serverDir,
  stdio: 'inherit',
  windowsHide: true,
});

child.on('error', err => {
  console.error('[api] Failed to start Django server:', err.message);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
