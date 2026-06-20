/**
 * Ask the web container to rebuild static pages (fire-and-forget).
 */
export function scheduleSiteRebuild(reason: string): void {
  const url = process.env.SITE_REBUILD_URL;
  const secret = process.env.WEBHOOK_SECRET;

  if (!url) {
    return;
  }

  if (!secret) {
    console.warn('[site-rebuild] skipped: WEBHOOK_SECRET is not set');
    return;
  }

  void fetch(url, {
    method: 'POST',
    headers: {
      'x-webhook-secret': secret,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error(`[site-rebuild] failed (${res.status}): ${text}`);
        return;
      }
      console.log(`[site-rebuild] triggered: ${reason}`);
    })
    .catch((err) => {
      console.error('[site-rebuild] error:', err);
    });
}

export function shouldRebuildForPostChange(
  previousStatus: 'draft' | 'published' | undefined,
  nextStatus: 'draft' | 'published',
): boolean {
  return nextStatus === 'published' || previousStatus === 'published';
}
