// 支持的加密算法类型
export type CryptoAlgorithm = 
  | 'aes-128-cbc' 
  | 'aes-192-cbc' 
  | 'aes-256-cbc' 
  | 'aes-128-gcm' 
  | 'aes-192-gcm' 
  | 'aes-256-gcm'

// 加密选项接口
export interface CryptoOptions {
  algorithm: CryptoAlgorithm
  key: string
  iv: string
  authTag?: string // GCM模式的认证标签
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
  // 清理和标准化Base64字符串
  let normalizedBase64 = base64
    .trim() // 去除首尾空白
    .replace(/\s+/g, '') // 去除所有空白字符
    .replace(/-/g, '+') // 替换URL安全的连字符
    .replace(/_/g, '/') // 替换URL安全的下划线
  
  // 确保正确的填充长度
  const padding = 4 - (normalizedBase64.length % 4)
  if (padding !== 4) {
    normalizedBase64 += '='.repeat(padding)
  }
  
  // 验证Base64格式
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalizedBase64)) {
    throw new Error('Invalid Base64 string format')
  }
  
  try {
    const binaryString = atob(normalizedBase64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  } catch (error) {
    throw new Error(`Failed to decode Base64 string: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// 将十六进制字符串转换为ArrayBuffer
function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes.buffer
}

// 获取算法的密钥长度（位）
function getKeyLengthForAlgorithm(algorithm: CryptoAlgorithm): number {
  const parts = algorithm.split('-')
  if (parts.length < 2) {
    throw new Error(`Invalid algorithm format: ${algorithm}`)
  }
  
  switch (parts[1]) {
    case '128':
      return 128
    case '192':
      return 192
    case '256':
      return 256
    default:
      throw new Error(`Unsupported key length: ${parts[1]}`)
  }
}

// 获取算法的密钥长度（字节）
function getKeyBytesForAlgorithm(algorithm: CryptoAlgorithm): number {
  return getKeyLengthForAlgorithm(algorithm) / 8
}

// 获取算法类型（CBC或GCM）
function getAlgorithmType(algorithm: CryptoAlgorithm): 'CBC' | 'GCM' {
  const parts = algorithm.split('-')
  if (parts.length < 3) {
    throw new Error(`Invalid algorithm format: ${algorithm}`)
  }
  
  switch (parts[2]) {
    case 'cbc':
      return 'CBC'
    case 'gcm':
      return 'GCM'
    default:
      throw new Error(`Unsupported algorithm type: ${parts[2]}`)
  }
}

// 从字符串生成密钥
export async function importKey(keyStr: string, algorithm: CryptoAlgorithm): Promise<CryptoKey> {
  const keyBytesLength = getKeyBytesForAlgorithm(algorithm)
  const keyHexLength = keyBytesLength * 2
  
  // 如果密钥是十六进制格式，转换为ArrayBuffer
  let keyBuffer: ArrayBuffer
  if (/^[0-9a-fA-F]+$/.test(keyStr) && keyStr.length === keyHexLength) {
    // 十六进制字符转换为ArrayBuffer
    keyBuffer = hexToArrayBuffer(keyStr)
  } else {
    // 否则使用UTF-8编码，并填充/截断到所需长度
    const encoder = new TextEncoder()
    const keyBytes = encoder.encode(keyStr)
    keyBuffer = new ArrayBuffer(keyBytesLength)
    const keyView = new Uint8Array(keyBuffer)
    // 只复制keyBytes的前keyBytesLength个字节
    const copyLength = Math.min(keyBytes.length, keyBytesLength)
    keyView.set(new Uint8Array(keyBytes).subarray(0, copyLength), 0)
  }

  const algorithmType = getAlgorithmType(algorithm)
  
  return crypto.subtle.importKey('raw', keyBuffer, { name: `AES-${algorithmType}` }, false, [
    'encrypt',
    'decrypt',
  ])
}

// 从字符串生成IV
export function importIv(ivStr: string): ArrayBuffer {
  // IV长度固定为16字节（128位），适用于所有AES算法
  const ivBytesLength = 16
  const ivHexLength = ivBytesLength * 2
  
  // 如果IV是十六进制格式，转换为ArrayBuffer
  if (/^[0-9a-fA-F]+$/.test(ivStr) && ivStr.length === ivHexLength) {
    // 32个十六进制字符 = 16字节（128位）
    return hexToArrayBuffer(ivStr)
  } else {
    // 否则使用UTF-8编码，并填充/截断到16字节
    const encoder = new TextEncoder()
    const ivBytes = encoder.encode(ivStr)
    const ivBuffer = new ArrayBuffer(ivBytesLength)
    const ivView = new Uint8Array(ivBuffer)
    // 只复制ivBytes的前16个字节，避免offset out of bounds错误
    const copyLength = Math.min(ivBytes.length, ivBytesLength)
    ivView.set(new Uint8Array(ivBytes).subarray(0, copyLength), 0)
    return ivBuffer
  }
}

// 生成随机密钥
export async function generateRandomKey(algorithm: CryptoAlgorithm): Promise<string> {
  const keyLength = getKeyLengthForAlgorithm(algorithm)
  const algorithmType = getAlgorithmType(algorithm)
  
  const key = await crypto.subtle.generateKey(
    { name: `AES-${algorithmType}`, length: keyLength }, 
    true, 
    ['encrypt', 'decrypt']
  )
  
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
    const key = await importKey(options.key, options.algorithm)
    const iv = importIv(options.iv)
    const data = await stringToArrayBuffer(str)
    const algorithmType = getAlgorithmType(options.algorithm)
    
    let result: ArrayBuffer
    
    if (algorithmType === 'GCM') {
      // GCM模式加密，需要处理认证标签
      const encrypted = await crypto.subtle.encrypt(
        { 
          name: 'AES-GCM', 
          iv, 
          tagLength: 128 // 128位认证标签
        }, 
        key, 
        data
      )
      
      result = encrypted
    } else {
      // CBC模式加密
      result = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv }, 
        key, 
        data
      )
    }
    
    return arrayBufferToBase64(result)
  } catch (error) {
    throw new Error(
      `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

// 解密字符串
export async function decryptString(str: string, options: CryptoOptions): Promise<string> {
  try {
    const key = await importKey(options.key, options.algorithm)
    const iv = importIv(options.iv)
    const data = base64ToArrayBuffer(str)
    const algorithmType = getAlgorithmType(options.algorithm)
    
    let decrypted: ArrayBuffer
    
    if (algorithmType === 'GCM') {
      // GCM模式解密，Web Crypto API会自动处理认证标签
      decrypted = await crypto.subtle.decrypt(
        { 
          name: 'AES-GCM', 
          iv, 
          tagLength: 128
        } as AesGcmParams, 
        key, 
        data
      )
    } else {
      // CBC模式解密
      decrypted = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv }, 
        key, 
        data
      )
    }
    
    return new TextDecoder().decode(decrypted)
  } catch (error) {
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}
