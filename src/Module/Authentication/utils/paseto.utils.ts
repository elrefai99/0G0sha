import { createPrivateKey, type KeyObject } from 'node:crypto'
import { V4 } from 'paseto'

export type TokenType = 'access' | 'refresh' | 'forget_password' | 'pending'

const normalizePem = (raw: string): string => {
  const match = raw.match(/-----BEGIN ([A-Z ]+?)-----([\s\S]*?)-----END \1-----/)
  if (!match) {
    throw new Error('Invalid PEM: missing BEGIN/END markers')
  }
  const label = match[1].trim()
  const body = match[2].replace(/\\n/g, '').replace(/\s/g, '')
  const lines = body.match(/.{1,64}/g)?.join('\n') ?? ''
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----\n`
}

const loadPrivateKey = (envKey: string): KeyObject => {
  const pem = process.env[envKey]
  if (!pem) {
    throw new Error(`Missing PASETO key: env var "${envKey}" is not set`)
  }
  return createPrivateKey(normalizePem(pem))
}

export const token_PASETO = async (payload: any, type: TokenType, expiresIn?: string): Promise<string> => {
  switch (type) {
    case 'access':
      const privateKey = loadPrivateKey('ACCESS_PRIVATE_KEY')
      const token = await V4.sign(
        {
          data: { user_id: payload.data.user_id },
          site: '0Gosha',
          token_version: 2,
          access_device: payload.access_device,
        },
        privateKey,
        { expiresIn: '2h' },
      )
      return token
    case 'refresh':
      const privateKeyRefresh = loadPrivateKey('REFRESH_PRIVATE_KEY')
      const tokenRefresh = await V4.sign(
        {
          data: { user_id: payload.data.user_id },
          site: '0Gosha',
          token_version: 2,
          access_device: payload.access_device,
        },
        privateKeyRefresh,
        { expiresIn: expiresIn || '30d' },
      )
      return tokenRefresh
    case 'forget_password':
      const privateKeyForgetPassword = loadPrivateKey('PRIVATE_FORGET_PASSWORD_SECRET_KY')
      const tokenForgetPassword = await V4.sign(
        {
          data: { user_id: payload.data.user_id },
          site: '0Gosha',
          token_version: 2,
          access_device: payload.access_device,
        },
        privateKeyForgetPassword,
        { expiresIn: '2h' },
      )
      return tokenForgetPassword
    case 'pending':
      const privateKeyPending = loadPrivateKey('PENDING_PRIVATE_KEY')
      const tokenPending = await V4.sign(
        {
          data: { user_id: payload.data.user_id },
          site: '0Gosha',
          token_version: 2,
          access_device: payload.access_device,
        },
        privateKeyPending,
        { expiresIn: '2h' },
      )
      return tokenPending
  }
}
