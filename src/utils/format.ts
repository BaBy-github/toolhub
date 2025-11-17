export type FormatOptions = { indent?: number; sortKeys?: boolean }
export type FormatResult = { ok: boolean; formatted?: string; error?: string }

export function formatJson(input: string, opts: FormatOptions = {}): FormatResult {
  const indent = typeof opts.indent === 'number' ? opts.indent : 2
  const sortKeys = !!opts.sortKeys
  const tryParse = (s: string) => {
    try {
      return { obj: JSON.parse(s) }
    } catch (e) {
      return { err: e as Error }
    }
  }

  let s = input?.trim() ?? ''
  if (!s) return { ok: true, formatted: '' }

  let parsed = tryParse(s)

  if (!parsed.obj) {
    try {
      const unescaped = JSON.parse(s)
      parsed = tryParse(unescaped)
    } catch {}
  }

  if (!parsed.obj) {
    if (/^[\s\S]*[‘’']/.test(s)) {
      s = s.replace(/'/g, '"')
      parsed = tryParse(s)
    }
  }

  if (!parsed.obj) {
    s = s.replace(/,\s*([}\]])/g, '$1')
    parsed = tryParse(s)
  }

  if (!parsed.obj) {
    return { ok: false, error: '无法解析为JSON' }
  }

  const obj = parsed.obj as any
  const stable = sortKeys ? sort(obj) : obj

  try {
    return { ok: true, formatted: JSON.stringify(stable, null, indent) }
  } catch {
    return { ok: false, error: '格式化失败' }
  }
}

function sort(v: any): any {
  if (Array.isArray(v)) return v.map(sort)
  if (v && typeof v === 'object') {
    const keys = Object.keys(v).sort()
    const o: any = {}
    for (const k of keys) o[k] = sort(v[k])
    return o
  }
  return v
}