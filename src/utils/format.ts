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

export function formatXml(input: string, opts: FormatOptions = {}): FormatResult {
  const indent = typeof opts.indent === 'number' ? opts.indent : 2
  let s = input?.trim() ?? ''
  if (!s) return { ok: true, formatted: '' }
  try {
    const doc = new DOMParser().parseFromString(s, 'application/xml')
    const err = doc.getElementsByTagName('parsererror')
    if (err && err.length > 0) return { ok: false, error: '无法解析为XML' }
    const root = doc.documentElement
    const formatted = renderXml(root, indent, 0)
    return { ok: true, formatted }
  } catch {
    return { ok: false, error: '无法解析为XML' }
  }
}

export function jsonToXml(input: string, opts: FormatOptions = {}): FormatResult {
  const indent = typeof opts.indent === 'number' ? opts.indent : 2
  let s = input?.trim() ?? ''
  if (!s) return { ok: true, formatted: '' }
  let obj: any
  try {
    obj = JSON.parse(s)
  } catch {
    return { ok: false, error: '无法解析为JSON' }
  }
  const xml = toXml('root', obj)
  const r = formatXml(xml, { indent })
  return r.ok ? { ok: true, formatted: r.formatted } : r
}

function xmlEsc(v: any): string {
  const s = String(v ?? '')
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function toXml(tag: string, v: any): string {
  if (v === null || v === undefined) return `<${tag}/>`
  if (Array.isArray(v)) return v.map((x) => toXml(tag, x)).join('')
  if (v && typeof v === 'object') {
    const attrs = v['@attributes'] && typeof v['@attributes'] === 'object' ? v['@attributes'] : null
    const keys = Object.keys(v).filter((k) => k !== '@attributes' && k !== '#text')
    const attrStr = attrs ? ' ' + Object.keys(attrs).map((k) => `${k}="${xmlEsc(attrs[k])}"`).join(' ') : ''
    if (v['#text'] != null && keys.length === 0) return `<${tag}${attrStr}>${xmlEsc(v['#text'])}</${tag}>`
    const children = keys.map((k) => toXml(k, v[k])).join('')
    return children ? `<${tag}${attrStr}>${children}</${tag}>` : `<${tag}${attrStr}/>`
  }
  return `<${tag}>${xmlEsc(v)}</${tag}>`
}

function prettyXml(xml: string, indent: number): string {
  let s = xml.trim()
  s = s.replace(/>\s+</g, '><')
  s = s.replace(/></g, '>$<')
  const tokens = s.split('$')
  const lines: string[] = []
  let lvl = 0
  for (const t of tokens) {
    const line = t.trim()
    if (!line) continue
    if (/^<\//.test(line)) lvl = Math.max(lvl - 1, 0)
    const pad = ' '.repeat(Math.max(0, lvl * indent))
    lines.push(pad + line)
    if (/^<([^!?][^>]*?)(?<!\/)>$/.test(line)) lvl++
  }
  return lines.join('\n')
}

function renderXml(el: Element, indent: number, level: number): string {
  const pad = ' '.repeat(level * indent)
  const name = el.tagName
  const attrs: string[] = []
  for (let i = 0; i < el.attributes.length; i++) {
    const at = el.attributes.item(i)
    if (at) attrs.push(`${at.name}="${xmlEsc(at.value)}"`)
  }
  const attrStr = attrs.length ? ' ' + attrs.join(' ') : ''
  const children: string[] = []
  let text = ''
  for (let i = 0; i < el.childNodes.length; i++) {
    const n = el.childNodes.item(i)
    if (!n) continue
    if (n.nodeType === 1) {
      children.push(renderXml(n as Element, indent, level + 1))
    } else if (n.nodeType === 3) {
      const t = (n.nodeValue || '').trim()
      if (t) text += t
    } else if (n.nodeType === 4) {
      const c = (n.nodeValue || '')
      children.push(' '.repeat((level + 1) * indent) + `<![CDATA[${c}]]>`)
    } else if (n.nodeType === 8) {
      const c = (n.nodeValue || '')
      children.push(' '.repeat((level + 1) * indent) + `<!--${c}-->`)
    }
  }
  if (!children.length && !text) return `${pad}<${name}${attrStr}/>`
  if (!children.length && text) return `${pad}<${name}${attrStr}>${xmlEsc(text)}</${name}>`
  const open = `${pad}<${name}${attrStr}>`
  const mid = children.join('\n')
  const close = `${pad}</${name}>`
  return `${open}\n${mid}\n${close}`
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
