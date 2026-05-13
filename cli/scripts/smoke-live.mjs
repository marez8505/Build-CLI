import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const eventId = 'build-2026';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runCli(args, cacheDir) {
  return execFileAsync(process.execPath, ['dist/index.js', ...args], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, MSEVENTS_CACHE_DIR: cacheDir },
  });
}

const cacheDir = await mkdtemp(join(tmpdir(), 'msevents-live-smoke-'));

try {
  const refresh = await runCli(['refresh', '--event', eventId, '--force'], cacheDir);
  process.stderr.write(refresh.stderr);

  const { stdout: statusStdout } = await runCli(['status', '--json'], cacheDir);
  const statuses = JSON.parse(statusStdout);
  const status = statuses.find((item) => item.eventId === eventId);
  assert(status?.meta?.sessionCount > 0, `Expected ${eventId} live catalog cache with sessions`);

  const sessions = JSON.parse(await readFile(join(cacheDir, `${eventId}-sessions.json`), 'utf8'));
  const sessionCode = sessions.find((session) => session.sessionCode)?.sessionCode;
  assert(sessionCode, 'No live session code found');

  const { stdout: searchStdout } = await runCli([
    'sessions',
    '--query',
    sessionCode,
    '--event',
    eventId,
    '--limit',
    '1',
    '--json',
  ], cacheDir);
  const results = JSON.parse(searchStdout);
  assert(
    Array.isArray(results)
      && results.some((session) => session.sessionCode === sessionCode && session.event === eventId),
    `Expected ${eventId} search result for ${sessionCode}`,
  );

  const { stdout: sessionStdout } = await runCli([
    'session',
    sessionCode,
    '--event',
    eventId,
    '--json',
  ], cacheDir);
  const session = JSON.parse(sessionStdout);
  assert(!Array.isArray(session), `Expected one session for ${sessionCode}`);
  assert(session.sessionCode === sessionCode, `Expected session ${sessionCode}, got ${session.sessionCode}`);
  assert(session.event === eventId, `Expected ${eventId} session, got ${session.event}`);
} finally {
  await rm(cacheDir, { recursive: true, force: true });
}
