// Settings: the Claude key, and backups (export / import).
import { exportBackup, importBackup } from './backup.js'
import { getKey, setKey } from './claude.js'
import { esc, openSheet, toast } from './ui.js'

function keySection() {
  const key = getKey()
  return `
    <section class="settings-section" aria-labelledby="claude-title">
      <h2 class="section-title" id="claude-title">Claude</h2>
      <p class="section-hint">With your own Anthropic API key, Claude turns brain dumps into tiny steps and suggests first moves. The key stays on this phone. Only text you send with those buttons goes to Claude, and Anthropic bills your account a small amount per use.</p>
      ${
        key
          ? `<p class="key-saved">Key saved, ending in <span translate="no">${esc(key.slice(-4))}</span></p>
             <button class="quiet danger" type="button" data-action="remove-key">Remove key</button>`
          : `<form class="field" data-form="save-key">
               <label class="visually-hidden" for="api-key">Anthropic API key</label>
               <input id="api-key" name="key" type="password" autocomplete="off" spellcheck="false" placeholder="sk-ant-…" />
               <button class="button" type="submit">Save key</button>
             </form>
             <p class="section-hint">Get a key at <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" translate="no">console.anthropic.com</a>.</p>`
      }
    </section>`
}

export function view() {
  return `
    <div class="screen">
      <a class="back" href="#projects">
        <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M10 4L6 8l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Projects
      </a>
      <h1 class="screen-title settings-title">Settings</h1>
      ${keySection()}
      <section class="settings-section" aria-labelledby="backup-title">
        <h2 class="section-title" id="backup-title">Backup</h2>
        <p class="section-hint">Everything lives only on this phone. Save a backup file now and then, so a cleared browser can’t take your projects with it.</p>
        <div class="sheet-actions">
          <button class="button" type="button" data-action="export">Export backup</button>
          <label class="quiet file-pick">
            Import backup
            <input class="visually-hidden" type="file" accept="application/json,.json" data-change="import" />
          </label>
        </div>
      </section>
    </div>`
}

const today = () => {
  const d = new Date()
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map((n) => String(n).padStart(2, '0')).join('-')
}

function confirmImport(app, next) {
  const projects = next.projects.length
  const sheet = openSheet(`
    <h2 class="sheet-title" id="sheet-title">Replace everything with this backup?</h2>
    <p class="sheet-hint">It has ${projects} ${projects === 1 ? 'project' : 'projects'}. What’s on this phone now will be replaced.</p>
    <div class="sheet-actions">
      <button class="quiet" type="button" data-sheet="keep">Keep what I have</button>
      <button class="button danger" type="button" data-sheet="replace">Replace everything</button>
    </div>`)
  sheet.setAttribute('aria-labelledby', 'sheet-title')
  sheet.querySelector('[data-sheet="keep"]').addEventListener('click', () => sheet.close())
  sheet.querySelector('[data-sheet="replace"]').addEventListener('click', () => {
    sheet.close()
    app.commit(next)
    toast('Backup imported')
  })
}

export const actions = {
  'save-key'(app, form) {
    const key = form.elements.key.value.trim()
    if (!key) return form.elements.key.focus()
    setKey(key)
    app.render()
    toast('Key saved')
  },
  'remove-key'(app) {
    setKey('')
    app.render()
    toast('Key removed')
  },
  export(app) {
    const file = new Blob([exportBackup(app.state)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.download = `do-now-backup-${today()}.json`
    link.click()
    URL.revokeObjectURL(link.href)
  },
  async import(app, input) {
    const [file] = input.files ?? []
    if (!file) return
    input.value = ''
    try {
      confirmImport(app, importBackup(await file.text()))
    } catch (error) {
      toast(error.message)
    }
  },
}
