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
    const looksEscaped = /(\\\{|\\\}|\\\[|\\\]|\\\"|\\n|\\t)/.test(s)
    if (looksEscaped) {
      try {
        let s2 = s
        s2 = s2.replace(/\\`/g, '')
        s2 = s2.replace(/`/g, '')
        s2 = s2.replace(/\\\//g, '/')
        s2 = s2.replace(/\\\"/g, '"')
        s2 = s2.replace(/\\([{}\[\]])/g, '$1')
        s2 = s2.replace(/\\(?!["\\\/bfnrtu])/g, '')
        parsed = tryParse(s2)
      } catch {}
    }
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
    const looksXml = /^\s*<([A-Za-z_][\w\-\.:]*)[\s\S]*>\s*$/.test(s)
    if (looksXml) {
      try {
        const doc = new DOMParser().parseFromString(s, 'application/xml')
        const errNodes = doc.getElementsByTagName('parsererror')
        if (!errNodes || errNodes.length === 0) {
          const root = doc.documentElement
          const toObj = (el: Element): any => {
            const o: any = {}
            if (el.attributes && el.attributes.length) {
              const a: any = {}
              for (let i = 0; i < el.attributes.length; i++) {
                const at = el.attributes.item(i)
                if (at) a[at.name] = at.value
              }
              o['@attributes'] = a
            }
            const childMap: Record<string, any[]> = {}
            let textVal = ''
            for (let i = 0; i < el.childNodes.length; i++) {
              const n = el.childNodes.item(i)
              if (!n) continue
              if (n.nodeType === 1) {
                const c = n as Element
                const k = c.tagName
                const v = toObj(c)
                if (!childMap[k]) childMap[k] = []
                childMap[k].push(v)
              } else if (n.nodeType === 3 || n.nodeType === 4) {
                const t = (n.nodeValue || '').trim()
                if (t) textVal += t
              }
            }
            for (const k in childMap) {
              const arr = childMap[k] || []
              o[k] = arr.length === 1 ? arr[0] : arr
            }
            if (textVal && Object.keys(o).length === 0) return textVal
            if (textVal) o['#text'] = textVal
            return o
          }
          const obj: any = {}
          obj[root.tagName] = toObj(root)
          const stable = sortKeys ? sort(obj) : obj
          return { ok: true, formatted: JSON.stringify(stable, null, indent) }
        }
      } catch {}
    }
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
