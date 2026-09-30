// Text shared into Do Now from another app's Share menu (the manifest's
// share_target). Android sends it as ?title=…&text=…&url=… on the start URL.

export function sharedText(params) {
  const text = (params.get('text') ?? '').trim() || (params.get('title') ?? '').trim()
  const url = (params.get('url') ?? '').trim()
  return url && !text.includes(url) ? [text, url].filter(Boolean).join('\n') : text
}
