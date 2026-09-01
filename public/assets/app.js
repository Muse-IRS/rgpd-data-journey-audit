const LOG_KEY = 'rgpd-data-journey-audit:local-action-log'

const form = document.querySelector('#audit-form')
const resetAudit = document.querySelector('#reset-audit')
const result = document.querySelector('#result')
const resultContent = document.querySelector('#result-content')
const gaugeHost = document.querySelector('#gauge-host')
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function gaugeLabel(score) {
  if (score < 35) {
    return {
      zone: 'green',
      title: 'Cohérence observée',
      explanation: 'Les éléments déclarés donnent une lecture plutôt cohérente. Cette position ne certifie pas la fiabilité du site.'
    }
  }

  if (score < 70) {
    return {
      zone: 'yellow',
      title: 'Vigilance recommandée',
      explanation: 'Plusieurs éléments restent absents, incomplets ou à vérifier avant de transmettre des données ou d’effectuer une action sensible.'
    }
  }

  return {
    zone: 'red',
    title: 'Alerte documentaire élevée',
    explanation: 'Des absences ou incohérences fortes sont déclarées. Cette lecture ne prouve pas une fraude, mais impose une vérification renforcée.'
  }
}

function buildGauge(data) {
  let score = 20
  const reasons = []
  const positive = []

  if (data.legalNotice) positive.push('Mentions légales trouvées.')
  else {
    score += 15
    reasons.push('Mentions légales absentes ou non vérifiées.')
  }

  if (data.privacyPolicy) positive.push('Politique de confidentialité trouvée.')
  else {
    score += 15
    reasons.push('Politique de confidentialité absente ou non vérifiée.')
  }

  if (data.rightsContact) positive.push('Moyen d’exercice des droits trouvé.')
  else {
    score += 12
    reasons.push('Aucun moyen clair d’exercer les droits n’est indiqué.')
  }

  if (data.cookiesInfo) positive.push('Information cookies / traceurs trouvée.')
  else {
    score += 8
    reasons.push('Information cookies / traceurs absente ou insuffisamment visible.')
  }

  if (data.entityIdentified) positive.push('Entité réelle déclarée sur le site.')
  else {
    score += 18
    reasons.push('Aucune société, association ou entité réelle clairement identifiée.')
  }

  if (data.registryMatch) {
    score -= 10
    positive.push('Entité indiquée comme vérifiable dans un registre officiel.')
  } else {
    score += 10
    reasons.push('Rattachement à un registre officiel non vérifié ou non indiqué.')
  }

  if (data.entityMismatch) {
    score += 35
    reasons.push('Incohérence déclarée entre site, société, SIREN/SIRET, adresse ou registre.')
  }

  if (data.paymentThirdParty) {
    score += 30
    reasons.push('Paiement ou destinataire économique déclaré comme différent de l’entité affichée.')
  }

  if (data.localStorageObserved && !data.cookiesInfo) {
    score += 8
    reasons.push('Stockage local observé sans information cookies / traceurs clairement trouvée.')
  }

  if (data.externalServices) positive.push('Services externes mentionnés.')
  else {
    score += 5
    reasons.push('Services externes non indiqués ou non vérifiés.')
  }

  if (data.retentionInfo) positive.push('Durées de conservation indiquées.')
  else {
    score += 8
    reasons.push('Durées de conservation non identifiées.')
  }

  if (data.legalBasisInfo) positive.push('Bases juridiques indiquées.')
  else {
    score += 8
    reasons.push('Bases juridiques non identifiées.')
  }

  const finalScore = clamp(score, 0, 100)
  const label = gaugeLabel(finalScore)

  return {
    score: finalScore,
    angle: -90 + (finalScore * 1.8),
    ...label,
    reasons,
    positive
  }
}

function buildReading(data, gauge) {
  const clear = [...gauge.positive]
  const missing = []
  const unclear = []
  const actions = []

  if (!data.legalNotice) missing.push('Mentions légales à rechercher ou vérifier.')
  if (!data.privacyPolicy) missing.push('Politique de confidentialité à rechercher ou vérifier.')
  if (!data.cookiesInfo) unclear.push('Absence ou visibilité insuffisante de l’information cookies / traceurs.')
  if (!data.rightsContact) missing.push('Moyen concret d’exercice des droits à identifier.')
  if (!data.entityIdentified) missing.push('Société, association ou organisme responsable à identifier.')
  if (!data.registryMatch) unclear.push('Rattachement à un registre officiel à vérifier.')
  if (!data.retentionInfo) missing.push('Durées de conservation non identifiées.')
  if (!data.legalBasisInfo) missing.push('Bases juridiques non identifiées.')

  if (data.entityMismatch) unclear.push('Incohérence forte déclarée entre l’identité affichée et les informations société.')
  if (data.paymentThirdParty) unclear.push('Destinataire économique ou paiement déclaré comme différent de l’entité affichée.')

  if (data.localStorageObserved) {
    clear.push('Stockage local observé ou annoncé.')
    actions.push('Vérifier si le stockage local est nécessaire, visible, effaçable et expliqué.')
  }

  if (data.externalServices) actions.push('Identifier les services externes, destinataires et finalités associées.')
  else unclear.push('Aucun service externe indiqué ou vérification non réalisée.')

  actions.push('Comparer mentions légales, confidentialité, cookies et fonctionnement observable.')
  actions.push('Vérifier l’entité déclarée dans une source officielle lorsque cette information est disponible.')
  actions.push('Conserver les captures ou liens utiles avant toute démarche.')

  return {
    clear,
    missing,
    unclear,
    actions
  }
}

function renderGauge(gauge) {
  gaugeHost.innerHTML = ''

  const wrapper = document.createElement('section')
  wrapper.className = `gauge-card ${gauge.zone}`
  wrapper.setAttribute('aria-label', 'Compteur de vigilance documentaire')

  const visual = document.createElement('div')
  visual.className = 'gauge'
  visual.style.setProperty('--needle-angle', `${gauge.angle}deg`)

  const needle = document.createElement('div')
  needle.className = 'gauge-needle'

  const hub = document.createElement('div')
  hub.className = 'gauge-hub'

  visual.append(needle, hub)

  const label = document.createElement('div')
  label.className = 'gauge-label'

  const title = document.createElement('strong')
  title.textContent = gauge.title

  const score = document.createElement('span')
  score.textContent = `${gauge.score}/100`

  const text = document.createElement('p')
  text.textContent = gauge.explanation

  const reasons = document.createElement('p')
  reasons.className = 'muted'
  reasons.textContent = gauge.reasons.length
    ? `Pourquoi cette position : ${gauge.reasons.slice(0, 4).join(' ')}`
    : 'Pourquoi cette position : les principaux éléments déclarés sont cohérents dans cette lecture locale.'

  label.append(title, score, text, reasons)
  wrapper.append(visual, label)
  gaugeHost.append(wrapper)
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
    entityIdentified: checkboxState('entity-identified'),
    registryMatch: checkboxState('registry-match'),
    entityMismatch: checkboxState('entity-mismatch'),
    paymentThirdParty: checkboxState('payment-third-party'),
    localStorageObserved: checkboxState('local-storage-observed'),
    externalServices: checkboxState('external-services'),
    retentionInfo: checkboxState('retention-info'),
    legalBasisInfo: checkboxState('legal-basis-info')
  }
  const gauge = buildGauge(data)
  const reading = buildReading(data, gauge)
  renderGauge(gauge)
  renderReading(reading, target)
  logAction('audit:local-reading-generated', {
    targetProvided: Boolean(target),
    target: target || null,
    checks: data,
    vigilance: {
      score: gauge.score,
      zone: gauge.zone,
      title: gauge.title
    }
  })
})

resetAudit.addEventListener('click', () => {
  form.reset()
  result.hidden = true
  gaugeHost.innerHTML = ''
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
