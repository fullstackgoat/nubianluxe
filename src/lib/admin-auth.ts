/** Comma-separated lists in env; singular CLERK_ADMIN_USER_ID / ADMIN_EMAIL still supported. */
function parseList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getAdminUserIds(): string[] {
  const plural = parseList(process.env.CLERK_ADMIN_USER_IDS);
  const single = parseList(process.env.CLERK_ADMIN_USER_ID);
  return [...new Set([...plural, ...single])];
}

export function getAdminEmails(): string[] {
  const plural = parseList(process.env.ADMIN_EMAILS);
  const single = parseList(process.env.ADMIN_EMAIL);
  return [...new Set([...plural, ...single].map((email) => email.toLowerCase()))];
}

export function isAdminConfigured(): boolean {
  return getAdminUserIds().length > 0 || getAdminEmails().length > 0;
}

export function isAdminUser(userId: string | null | undefined, userEmail: string | null | undefined): boolean {
  if (!isAdminConfigured()) return false;

  const adminIds = getAdminUserIds();
  if (userId && adminIds.includes(userId)) return true;

  const adminEmails = getAdminEmails();
  if (userEmail && adminEmails.includes(userEmail.toLowerCase())) return true;

  return false;
}
