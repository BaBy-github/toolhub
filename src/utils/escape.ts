export interface EscapeOptions {
  escapeDoubleQuotes?: boolean
  escapeSingleQuotes?: boolean
  escapeNewlines?: boolean
}

export function escapeString(str: string, options?: EscapeOptions): string {
  let result = str
  
  if (options?.escapeNewlines ?? true) {
    result = result.replace(/\n/g, '\\n')
    result = result.replace(/\r/g, '\\r')
  }
  
  if (options?.escapeDoubleQuotes ?? true) {
    result = result.replace(/"/g, '\\"')
  }
  
  if (options?.escapeSingleQuotes ?? true) {
    result = result.replace(/'/g, "\\'")
  }
  
  return result
}

export function unescapeString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
}