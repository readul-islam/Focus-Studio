import { spawn, spawnSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { platform } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mobileDir = join(root, 'mobile');
const SIMULATOR_NAME = 'iPhone 16 Pro';
const DEVICE_TYPE = 'com.apple.CoreSimulator.SimDeviceType.iPhone-16-Pro';
const METRO_PORT = 8081;
const API_PORT = 8000;

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (result.error) throw result.error;
  return result;
}

function killPort(port) {
  const pids = run('lsof', ['-ti', `:${port}`]);
  if (!pids.stdout.trim()) return;
  console.log(`[ios] Stopping process on port ${port}…`);
  for (const pid of pids.stdout.trim().split('\n')) {
    if (pid) run('kill', ['-9', pid.trim()]);
  }
}

function waitForPort(port, timeoutMs = 120_000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const socket = createConnection({ port, host: '127.0.0.1' });
      socket.once('connect', () => {
        socket.end();
        resolve(true);
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timed out waiting for port ${port}`));
          return;
        }
        setTimeout(check, 1000);
      });
    };
    check();
  });
}

function getIosRuntime() {
  const list = run('xcrun', ['simctl', 'list', 'runtimes']);
  const match = list.stdout.match(/iOS [\d.]+ \([\d.]+ - [^)]+\) - (com\.apple\.CoreSimulator\.SimRuntime\.iOS-[\d-]+)/);
  if (match) return match[1];
  return 'com.apple.CoreSimulator.SimRuntime.iOS-26-4';
}

function ensureSimulator() {
  if (platform() !== 'darwin') {
    console.error('[ios] iOS simulator requires macOS.');
    process.exit(1);
  }

  const list = run('xcrun', ['simctl', 'list', 'devices', 'available']);
  const line = list.stdout
    .split('\n')
    .find(l => l.includes(SIMULATOR_NAME) && !l.includes('Max'));
  if (line) {
    const match = line.match(/\(([0-9A-F-]{36})\)/i);
    if (match) return match[1];
  }

  const runtime = getIosRuntime();
  console.log(`[ios] Creating ${SIMULATOR_NAME} simulator…`);
  const created = run('xcrun', ['simctl', 'create', SIMULATOR_NAME, DEVICE_TYPE, runtime]);
  const id = created.stdout.trim();
  if (!id) throw new Error('Failed to create simulator');
  return id;
}

function enableSimulatorSoftwareKeyboard() {
  // When the Mac keyboard is "connected", taps may not show the on-screen keyboard.
  run('defaults', ['write', 'com.apple.iphonesimulator', 'ConnectHardwareKeyboard', '-bool', 'false']);
}

function bootSimulator() {
  enableSimulatorSoftwareKeyboard();
  ensureSimulator();
  run('xcrun', ['simctl', 'boot', SIMULATOR_NAME], { stdio: 'ignore' });
  spawn('open', ['-a', 'Simulator'], { detached: true, stdio: 'ignore' }).unref();
}

function startApi() {
  console.log('[ios] Starting Django API…');
  const child = spawn('pnpm', ['--filter', '@focuspilot/server', 'run', 'dev'], {
    cwd: root,
    detached: true,
    stdio: 'ignore',
    env: process.env,
  });
  child.unref();
}

async function main() {
  // Always restart Metro from mobile/ — stale root Metro breaks React + keyboard
  killPort(METRO_PORT);

  const apiUp = await new Promise(resolve => {
    const socket = createConnection({ port: API_PORT, host: '127.0.0.1' });
    socket.once('connect', () => {
      socket.end();
      resolve(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
  });

  if (!apiUp) {
    startApi();
    console.log(`[ios] Waiting for API on :${API_PORT}…`);
    await waitForPort(API_PORT);
  }

  bootSimulator();

  console.log(`[ios] Starting Metro from mobile/ and opening ${SIMULATOR_NAME}…`);
  console.log('[ios] Tip: If typing does not appear, press Cmd+K in Simulator to toggle the keyboard.\n');

  const child = spawn('npx', ['expo', 'start', '--ios', '--go', '--clear'], {
    cwd: mobileDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      EXPO_IOS_SIMULATOR_DEVICE_NAME: SIMULATOR_NAME,
    },
  });

  child.on('exit', code => process.exit(code ?? 0));
}

main().catch(err => {
  console.error('[ios]', err.message);
  process.exit(1);
});
