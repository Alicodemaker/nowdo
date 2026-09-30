// Saves Do Now's state in this browser only (ADR 0001).
// If storage is missing or unreadable, the app starts fresh instead of breaking.
import { createState } from './store.js'
import { exportBackup, importBackup } from './backup.js'

const KEY = 'do-now'

export function load() {
  try {
    const saved = localStorage.getItem(KEY)
    return saved ? importBackup(saved) : createState()
  } catch {
    return createState()
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, exportBackup(state))
    return true
  } catch {
    return false
  }
}
