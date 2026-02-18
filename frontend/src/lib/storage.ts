import CryptoJS from 'crypto-js'

const SECRET_SALT =
  import.meta.env.VITE_STORAGE_SALT || 'DEFAULT_SALT_IF_MISSING'

export const secureStorage = {
  setItem: (key: string, value: string) => {
    try {
      const encrypted = CryptoJS.AES.encrypt(value, SECRET_SALT).toString()
      localStorage.setItem(key, encrypted)
    } catch (error) {
      console.error('Error encrypting data:', error)
    }
  },
  getItem: (key: string): string | null => {
    const encrypted = localStorage.getItem(key)
    if (!encrypted) return null

    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_SALT)
      const originalText = bytes.toString(CryptoJS.enc.Utf8)
      return originalText || null
    } catch (e) {
      console.error('Storage decryption failed', e)
      return null
    }
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key)
  },
}
