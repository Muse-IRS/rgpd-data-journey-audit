const LOG_KEY = 'rgpd-data-journey-audit:local-action-log'

const form = document.querySelector('#audit-form')
const resetAudit = document.querySelector('#reset-audit')
const result = document.querySelector('#result')
const resultContent = document.querySelector('#result-content')
const refreshLog = document.querySelector('#refresh-log')
const exportLog = document.querySelector('#export-log')
const clearLog = document.querySelector('#clear-log')
const logOutput = document.querySelector('#log-output')

function readLog() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOG_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLog(entries) {
  localStorage.setItem(LOG_KEY, JSON.stringify(entries.slice(-250)))
}

function safeText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90)
}

function logAction(type, details = {}) {
  const entries = readLog()
  entries.push({
    at: new Date().toISOString(),
    type,
    page: location.pathname,
    details
  })
  writeLog(entries)
}

function displayLog() {
  const entries = readLog()
  logOutput.textContent = entries.length
    ? JSON.stringify(entries, null, 2)
    : 'Journal local vide.'
}

function checkboxState(name) {
  const item = form.elements[name]
  return Boolean(item && item.checked)
}

function card(title, body) {
  const node = document.createElement('article')
  node.className = 'card'
  const heading = document.createElement('strong')
  const paragraph = document.createElement('p')
  heading.textContent = title
  paragraph.textContent = body
  node.append(heading, paragraph)
  return node
}

function yesNo(value) {
  return value ? 'présent ou indiqué' : 'absent, non observé ou à vérifier'
}

function buildReading(data) {
  const clear = []
  const missing = []
  const unclear = []
  const actions = []

  if (data.legalNotice) clear.push('Mentions légales indiquées.')
  else missing.push('Mentions légales à rechercher ou vérifier.')

  if (data.privacyPolicy) clear.push('Politique de confidentialité indiquée.')
  else missing.push('Politique de confidentialité à rechercher ou vérifier.')

  if (data.cookiesInfo) clear.push('Information cookies / traceurs indiquée.')
  else unclear.push('Absence ou visibilité insuffisante de l’information cookies / traceurs.')

  if (data.rightsContact) clear.push('Moyen d’exercice des droits indiqué.')
  else missing.push('Moyen concret d’exercice des droits à identifier.')

  if (data.localStorageObserved) {
    clear.push('Stockage local observé ou annoncé.')
    actions.push('Vérifier si le stockage local est nécessaire, visible, effaçable et expliqué.')
  }

  if (data.externalServices) actions.push('Identifier les services externes, destinataires et finalités associées.')
  else unclear.push('Aucun service externe indiqué ou vérification non réalisée.')

  if (!data.retentionInfo) missing.push('Durées de conservation non identifiées.')
  if (!data.legalBasisInfo) missing.push('Bases juridiques non identifiées.')

  actions.push('Comparer mentions légales, confidentialité, cookies et fonctionnement observable.')
  actions.push('Conserver les captures ou liens utiles avant toute démarche.')

  return {
    clear,
    missing,
    unclear,
    actions
  }
}

function renderReading(reading, target) {
  resultContent.innerHTML = ''
  resultContent.append(
    card('Site / interface', target || 'Non renseigné'),
    card('Ce qui est clair', reading.clear.join(' ') || 'Aucun élément clair renseigné.'),
    card('Ce qui manque', reading.missing.join(' ') || 'Aucun manque déclaré dans cette lecture.'),
    card('Ce qui reste flou', reading.unclear.join(' ') || 'Aucune zone floue déclarée dans cette lecture.'),
    card('Actions possibles', reading.actions.join(' '))
  )
  result.hidden = false
}

form.addEventListener('submit', event => {
  event.preventDefault()
  const target = document.querySelector('#target-url').value.trim()
  const data = {
    legalNotice: checkboxState('legal-notice'),
    privacyPolicy: checkboxState('privacy-policy'),
    cookiesInfo: checkboxState('cookies-info'),
    rightsContact: checkboxState('rights-contact'),
    localStorageObserved: checkboxState('local-storage-observed'),
    externalServices: checkboxState('external-services'),
    retentionInfo: checkboxState('retention-info'),
    legalBasisInfo: checkboxState('legal-basis-info')
  }
  const reading = buildReading(data)
  renderReading(reading, target)
  logAction('audit:local-reading-generated', {
    targetProvided: Boolean(target),
    target: target || null,
    checks: data
  })
})

resetAudit.addEventListener('click', () => {
  form.reset()
  result.hidden = true
  logAction('audit:form-reset')
})

refreshLog.addEventListener('click', () => {
  logAction('local-log:displayed')
  displayLog()
})

exportLog.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(readLog(), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'rgpd-data-journey-local-log.json'
  link.click()
  URL.revokeObjectURL(url)
  logAction('local-log:exported')
})

clearLog.addEventListener('click', () => {
  localStorage.removeItem(LOG_KEY)
  logOutput.textContent = 'Journal local effacé.'
})

document.addEventListener('click', event => {
  const target = event.target.closest('button, a, input, summary')
  if (!target) return
  logAction('ui:click', {
    tag: target.tagName.toLowerCase(),
    id: target.id || null,
    name: target.getAttribute('name') || null,
    text: safeText(target.textContent || target.getAttribute('aria-label') || target.getAttribute('title')),
    inputType: target.getAttribute('type') || null
  })
}, true)
