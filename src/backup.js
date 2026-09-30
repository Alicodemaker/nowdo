// Export and import a Do Now backup file. Import either returns a whole,
// valid state or throws; it never half-imports.
import { createState, LOOSE_ENDS_ID } from './store.js'

const NOT_A_BACKUP = "This file isn't a Do Now backup."

export function exportBackup(state, now = new Date()) {
  return JSON.stringify({ app: 'do-now', version: 1, exportedAt: now.toISOString(), state }, null, 2)
}

const isStep = (s) =>
  typeof s?.id === 'string' && typeof s.text === 'string' && (s.doneAt === null || Number.isFinite(s.doneAt))

const isProject = (p) =>
  typeof p?.id === 'string' && typeof p.name === 'string' && Array.isArray(p.steps) && p.steps.every(isStep)

export function importBackup(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(NOT_A_BACKUP)
  }
  const projects = data?.state?.projects
  if (data?.app !== 'do-now' || !Array.isArray(projects) || !projects.every(isProject)) {
    throw new Error(NOT_A_BACKUP)
  }
  const withLooseEnds = projects.some((p) => p.id === LOOSE_ENDS_ID)
    ? projects
    : [...createState().projects, ...projects]
  const focusId = withLooseEnds.some((p) => p.id === data.state.focusId) ? data.state.focusId : LOOSE_ENDS_ID
  return { projects: withLooseEnds, focusId }
}
