// 加密选项接口
export interface CryptoOptions {
  algorithm: 'aes-256-cbc'
  key: string
  iv: string
}

// 将字符串转换为ArrayBuffer
async function stringToArrayBuffer(str: string): Promise<ArrayBuffer> {
  return new TextEncoder().encode(str).buffer
}

// 将ArrayBuffer转换为Base64字符串
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

// 将Base64字符串转换为ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

// 将十六进制字符串转换为ArrayBuffer
function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes.buffer
}

// 从字符串生成密钥
export async function importKey(keyStr: string): Promise<CryptoKey> {
  // 如果密钥是十六进制格式，转换为ArrayBuffer
  let keyBuffer: ArrayBuffer
  if (/^[0-9a-fA-F]+$/.test(keyStr) && keyStr.length === 64) {
    // 64个十六进制字符 = 32字节（256位）
    keyBuffer = hexToArrayBuffer(keyStr)
  } else {
    // 否则使用UTF-8编码，并填充/截断到32字节
    const encoder = new TextEncoder()
    const keyBytes = encoder.encode(keyStr)
    keyBuffer = new ArrayBuffer(32)
    const keyView = new Uint8Array(keyBuffer)
    keyView.set(new Uint8Array(keyBytes), 0)
  }

  return crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-CBC' }, false, [
    'encrypt',
    'decrypt',
  ])
}

// 从字符串生成IV
export function importIv(ivStr: string): ArrayBuffer {
  // 如果IV是十六进制格式，转换为ArrayBuffer
  if (/^[0-9a-fA-F]+$/.test(ivStr) && ivStr.length === 32) {
    // 32个十六进制字符 = 16字节（128位）
    return hexToArrayBuffer(ivStr)
  } else {
    // 否则使用UTF-8编码，并填充/截断到16字节
    const encoder = new TextEncoder()
    const ivBytes = encoder.encode(ivStr)
    const ivBuffer = new ArrayBuffer(16)
    const ivView = new Uint8Array(ivBuffer)
    ivView.set(new Uint8Array(ivBytes), 0)
    return ivBuffer
  }
}

// 生成随机密钥（32字节 = 256位）
export async function generateRandomKey(): Promise<string> {
  const key = await crypto.subtle.generateKey({ name: 'AES-CBC', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ])
  const keyBuffer = await crypto.subtle.exportKey('raw', key)
  return arrayBufferToBase64(keyBuffer)
}

// 生成随机IV（16字节 = 128位）
export function generateRandomIv(): string {
  const iv = crypto.getRandomValues(new Uint8Array(16))
  return arrayBufferToBase64(iv.buffer)
}

// 加密字符串
export async function encryptString(str: string, options: CryptoOptions): Promise<string> {
  try {
    const key = await importKey(options.key)
    const iv = importIv(options.iv)
    const data = await stringToArrayBuffer(str)
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, data)
    return arrayBufferToBase64(encrypted)
  } catch (error) {
    throw new Error(
      `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

// 解密字符串
export async function decryptString(str: string, options: CryptoOptions): Promise<string> {
  try {
    const key = await importKey(options.key)
    const iv = importIv(options.iv)
    const data = base64ToArrayBuffer(str)
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, data)
    return new TextDecoder().decode(decrypted)
  } catch (error) {
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}
