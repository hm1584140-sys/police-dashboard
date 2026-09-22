export async function logClientAction(
  token: string | null,
  action: string,
  targetType = '',
  targetId = '',
  details: Record<string, unknown> = {},
) {
  if (!token) return
  try {
    await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action, targetType, targetId, details }),
      keepalive: true,
    })
  } catch {
    // Audit logging must never block the user's edit.
  }
}
