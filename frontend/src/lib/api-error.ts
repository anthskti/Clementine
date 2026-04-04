/** FastAPI often returns `{ detail: string | object }` on errors. */
export async function readApiError(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = await res.json();
    const d = body?.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) return JSON.stringify(d);
    if (d != null) return JSON.stringify(d);
  } catch {
    /* ignore */
  }
  return `${fallback} (HTTP ${res.status})`;
}
