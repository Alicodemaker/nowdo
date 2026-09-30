// Do Now's data and rules. Every function is pure: state in, new state out.
// Words follow GLOSSARY.md: Project, Step, Loose ends, Focus project, Now.

export const LOOSE_ENDS_ID = 'loose-ends'

const newId = () => crypto.randomUUID()

const clean = (text) => (text ?? '').trim()

const makeStep = (text, id = newId()) => ({ id, text, doneAt: null })

export function createState() {
  return {
    projects: [{ id: LOOSE_ENDS_ID, name: 'Loose ends', steps: [] }],
    focusId: LOOSE_ENDS_ID,
  }
}

export function addProject(state, { id = newId(), name, steps = [], focus = false }) {
  if (!clean(name)) return state
  const project = { id, name: clean(name), steps: steps.map(clean).filter(Boolean).map((text) => makeStep(text)) }
  return {
    ...state,
    projects: [...state.projects, project],
    focusId: focus ? id : state.focusId,
  }
}

export function nowStep(state) {
  const project = state.projects.find((p) => p.id === state.focusId)
  const step = project?.steps.find((s) => !s.doneAt)
  if (!step) return null
  const done = project.steps.filter((s) => s.doneAt).length
  return { project, step, position: done + 1, total: project.steps.length }
}

// Apply fn to the one Step with this id, wherever it lives.
function updateStep(state, stepId, fn) {
  return {
    ...state,
    projects: state.projects.map((p) =>
      p.steps.some((s) => s.id === stepId)
        ? { ...p, steps: p.steps.map((s) => (s.id === stepId ? fn(s) : s)) }
        : p,
    ),
  }
}

export function markDone(state, stepId, now = new Date()) {
  return updateStep(state, stepId, (s) => ({ ...s, doneAt: now.getTime() }))
}

export function undoDone(state, stepId) {
  return updateStep(state, stepId, (s) => ({ ...s, doneAt: null }))
}

export function stepsToday(state, now = new Date()) {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return state.projects
    .flatMap((p) => p.steps)
    .filter((s) => s.doneAt !== null && s.doneAt >= midnight && s.doneAt <= now.getTime()).length
}


function updateProject(state, projectId, fn) {
  return { ...state, projects: state.projects.map((p) => (p.id === projectId ? fn(p) : p)) }
}

function projectOf(state, stepId) {
  return state.projects.find((p) => p.steps.some((s) => s.id === stepId))
}

// Take a Step out of its list and put it back at the index where() picks.
function moveStep(state, stepId, where) {
  const project = projectOf(state, stepId)
  if (!project) return state
  const step = project.steps.find((s) => s.id === stepId)
  const rest = project.steps.filter((s) => s.id !== stepId)
  const at = where(rest)
  return updateProject(state, project.id, (p) => ({ ...p, steps: [...rest.slice(0, at), step, ...rest.slice(at)] }))
}

export function notNow(state, stepId) {
  return moveStep(state, stepId, (rest) => rest.length)
}

export function moveToTop(state, stepId) {
  return moveStep(state, stepId, () => 0)
}

export function makeSmaller(state, text) {
  const now = nowStep(state)
  if (!now || !clean(text)) return state
  return updateProject(state, now.project.id, (p) => {
    const at = p.steps.indexOf(now.step)
    return { ...p, steps: [...p.steps.slice(0, at), makeStep(clean(text)), ...p.steps.slice(at)] }
  })
}

export function addStep(state, projectId, text) {
  if (!clean(text)) return state
  return updateProject(state, projectId, (p) => ({ ...p, steps: [...p.steps, makeStep(clean(text))] }))
}

export function capture(state, text) {
  return addStep(state, LOOSE_ENDS_ID, text)
}

export function setFocus(state, projectId) {
  return state.projects.some((p) => p.id === projectId) ? { ...state, focusId: projectId } : state
}

export function isFinished(project) {
  return project.id !== LOOSE_ENDS_ID && project.steps.length > 0 && project.steps.every((s) => s.doneAt)
}

export function editStep(state, stepId, text) {
  if (!clean(text)) return state
  return updateStep(state, stepId, (s) => ({ ...s, text: clean(text) }))
}

export function deleteStep(state, stepId) {
  return {
    ...state,
    projects: state.projects.map((p) => ({ ...p, steps: p.steps.filter((s) => s.id !== stepId) })),
  }
}

export function deleteProject(state, projectId) {
  if (projectId === LOOSE_ENDS_ID) return state
  return {
    ...state,
    projects: state.projects.filter((p) => p.id !== projectId),
    focusId: state.focusId === projectId ? LOOSE_ENDS_ID : state.focusId,
  }
}
