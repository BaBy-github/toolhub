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

export function unescapeString(str: string, options?: EscapeOptions): string {
  let result = str

  // 反转义换行符
  if (options?.escapeNewlines ?? true) {
    result = result.replace(/\\n/g, '\n')
    result = result.replace(/\\r/g, '\r')
  }

  // 反转义双引号
  if (options?.escapeDoubleQuotes ?? true) {
    result = result.replace(/\\"/g, '"')
  }

  // 反转义单引号
  if (options?.escapeSingleQuotes ?? true) {
    result = result.replace(/\\'/g, "'")
  }

  // 总是反转义反斜杠，因为它是转义字符的标记
  result = result.replace(/\\\\/g, '\\')

  return result
}
