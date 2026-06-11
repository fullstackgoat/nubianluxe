let consecutiveFailures = 0;

export function markDbUnavailable() {
  consecutiveFailures += 1;
}

export function markDbAvailable() {
  consecutiveFailures = 0;
}

/** Only skip DB after repeated failures in the same process. */
export function shouldSkipDb(): boolean {
  return consecutiveFailures >= 3;
}
