import crypto from 'crypto'

const SALT_BYTES = 16
const KEY_LEN = 64

export function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex')
  const hash = crypto.scryptSync(password, salt, KEY_LEN).toString('hex')
  return { hash, salt }
}

export function verifyPassword(password, salt, storedHash) {
  if (!salt || !storedHash) return false
  const hash = crypto.scryptSync(password, salt, KEY_LEN).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'))
}
