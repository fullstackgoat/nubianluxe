const COOLDOWN_MS = 60_000;
let dbDownUntil = 0;

export function markDbUnavailable() {
  dbDownUntil = Date.now() + COOLDOWN_MS;
}

export function shouldSkipDb(): boolean {
  return Date.now() < dbDownUntil;
}
