const LOG_KEY = 'rgpd-data-journey-audit:local-action-log'
const AUDIT_KEY = 'rgpd-data-journey-audit:last-local-audit'
const SVG_NS = 'http://www.w3.org/2000/svg'

const form = document.querySelector('#audit-form')
const resetAudit = document.querySelector('#reset-audit')
const result = document.querySelector('#result')
const resultContent = document.querySelector('#result-content')
const gaugeHost = document.querySelector('#gauge-host')
const ssfHost = document.querySelector('#ssf-host')
const entityHost = document.querySelector('#entity-host')
const refreshLog = document.querySelector('#refresh-log')
const exportLog = document.querySelector('#export-log')
const clearLog = document.querySelector('#clear-log')
const explainLocalStorage = document.querySelector('#explain-local-storage')
const showLocalStorage = document.querySelector('#show-local-storage')
const restoreLastAudit = document.querySelector('#restore-last-audit')
const clearAllLocalData = document.querySelector('#clear-all-local-data')
const logOutput = document.querySelector('#log-output')
const localStorageExplanation = document.querySelector('#local-storage-explanation')
const storageOutput = document.querySelector('#storage-output')

function readJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null')
    return parsed === null ? fallback : parsed
  } catch {
    return fallback
  }
}

function readLog() {
  const parsed = readJson(LOG_KEY, [])
  return Array.isArray(parsed) ? parsed : []
}

function writeLog(entries) {
  localStorage.setItem(LOG_KEY, JSON.stringify(entries.slice(-250)))
}

function readLastAudit() {
  const parsed = readJson(AUDIT_KEY, null)
  return parsed && typeof parsed === 'object' ? parsed : null
}

function writeLastAudit(snapshot) {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(snapshot))
}

function safeText(value, maxLength = 120) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
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

function fieldValue(name) {
  const item = form.elements[name]
  return item ? safeText(item.value, 180) : ''
}

function setCheckbox(name, value) {
  const item = form.elements[name]
  if (item) item.checked = Boolean(value)
}

function setField(name, value) {
  const item = form.elements[name]
  if (item) item.value = value || ''
}

function normalizeDigits(value) {
  return String(value || '').replace(/\D+/g, '')
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

function makeBadge(status) {
  const badge = document.createElement('span')
  badge.className = `status-badge ${status.toLowerCase()}`
  badge.textContent = status
  return badge
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function ssfStatus({ present, invalid = false, contradicted = false, confirmed = false }) {
  if (contradicted || invalid) return 'UNSAT'
  if (present && confirmed) return 'SAT'
  return 'UNKNOWN'
}

function ssfNote(status, sat, unsat, unknown) {
  if (status === 'SAT') return sat
  if (status === 'UNSAT') return unsat
  return unknown
}

function collectFormData() {
  return {
    target: fieldValue('target-url'),
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
    legalBasisInfo: checkboxState('legal-basis-info'),
    entityName: fieldValue('entity-name'),
    legalForm: fieldValue('legal-form'),
    siren: fieldValue('siren'),
    siret: fieldValue('siret'),
    entityAddress: fieldValue('entity-address'),
    officialSource: fieldValue('official-source'),
    entityLocation: fieldValue('entity-location'),
    sirenLocation: fieldValue('siren-location'),
    siretLocation: fieldValue('siret-location'),
    addressLocation: fieldValue('address-location'),
    rightsLocation: fieldValue('rights-location')
  }
}

function fillForm(data) {
  setField('target-url', data.target)
  setField('entity-name', data.entityName)
  setField('legal-form', data.legalForm)
  setField('siren', data.siren)
  setField('siret', data.siret)
  setField('entity-address', data.entityAddress)
  setField('official-source', data.officialSource)
  setField('entity-location', data.entityLocation)
  setField('siren-location', data.sirenLocation)
  setField('siret-location', data.siretLocation)
  setField('address-location', data.addressLocation)
  setField('rights-location', data.rightsLocation)

  ;[
    'legal-notice',
    'privacy-policy',
    'cookies-info',
    'rights-contact',
    'entity-identified',
    'registry-match',
    'entity-mismatch',
    'payment-third-party',
    'local-storage-observed',
    'external-services',
    'retention-info',
    'legal-basis-info'
  ].forEach(name => {
    const camel = name.replace(/-([a-z])/g, (_, char) => char.toUpperCase())
    setCheckbox(name, data[camel])
  })
}

function buildEntityRows(data) {
  const sirenDigits = normalizeDigits(data.siren)
  const siretDigits = normalizeDigits(data.siret)
  const sirenInvalid = Boolean(data.siren && sirenDigits.length !== 9)
  const siretInvalid = Boolean(data.siret && siretDigits.length !== 14)

  const rows = [
    {
      key: 'entityName',
      label: 'Dénomination / entité affichée',
      value: data.entityName,
      location: data.entityLocation,
      source: data.officialSource,
      status: ssfStatus({
        present: Boolean(data.entityName || data.entityIdentified),
        contradicted: data.entityMismatch,
        confirmed: data.registryMatch
      })
    },
    {
      key: 'legalForm',
      label: 'Forme juridique',
      value: data.legalForm,
      location: data.entityLocation,
      source: data.officialSource,
      status: ssfStatus({
        present: Boolean(data.legalForm),
        contradicted: data.entityMismatch,
        confirmed: data.registryMatch
      })
    },
    {
      key: 'siren',
      label: 'SIREN',
      value: data.siren,
      location: data.sirenLocation,
      source: data.officialSource,
      status: ssfStatus({
        present: Boolean(data.siren),
        invalid: sirenInvalid,
        contradicted: data.entityMismatch,
        confirmed: data.registryMatch
      })
    },
    {
      key: 'siret',
      label: 'SIRET',
      value: data.siret,
      location: data.siretLocation,
      source: data.officialSource,
      status: ssfStatus({
        present: Boolean(data.siret),
        invalid: siretInvalid,
        contradicted: data.entityMismatch,
        confirmed: data.registryMatch
      })
    },
    {
      key: 'address',
      label: 'Adresse déclarée',
      value: data.entityAddress,
      location: data.addressLocation,
      source: data.officialSource,
      status: ssfStatus({
        present: Boolean(data.entityAddress),
        contradicted: data.entityMismatch,
        confirmed: data.registryMatch
      })
    },
    {
      key: 'rights',
      label: 'Droits RGPD / contact',
      value: data.rightsContact ? 'Moyen d’exercice des droits trouvé' : '',
      location: data.rightsLocation,
      source: 'Site audité',
      status: ssfStatus({
        present: Boolean(data.rightsContact),
        confirmed: Boolean(data.rightsContact && data.rightsLocation)
      })
    },
    {
      key: 'payment',
      label: 'Destinataire économique / paiement',
      value: data.paymentThirdParty ? 'Différent ou incohérent selon lecture utilisateur' : 'Non signalé comme différent',
      location: 'Parcours d’achat / paiement / CGV',
      source: 'Observation utilisateur',
      status: data.paymentThirdParty ? 'UNSAT' : 'UNKNOWN'
    }
  ]

  return rows.map(row => ({
    ...row,
    value: row.value || 'Non renseigné',
    location: row.location || 'Emplacement non renseigné',
    source: row.source || 'Source externe non renseignée',
    note: ssfNote(
      row.status,
      'Cohérent selon les éléments renseignés et la vérification déclarée.',
      'Incohérent, invalide ou contradictoire selon les éléments renseignés.',
      'Absent, non localisé ou insuffisamment vérifié.'
    )
  }))
}

function summarizeSsf(rows) {
  const counts = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1
    return acc
  }, { SAT: 0, UNSAT: 0, UNKNOWN: 0 })

  return {
    sat: counts.SAT || 0,
    unsat: counts.UNSAT || 0,
    unknown: counts.UNKNOWN || 0
  }
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

function buildGauge(data, entityRows) {
  let score = 18
  const reasons = []
  const positive = []
  const ssf = summarizeSsf(entityRows)

  if (data.legalNotice) positive.push('Mentions légales trouvées.')
  else {
    score += 13
    reasons.push('Mentions légales absentes ou non vérifiées.')
  }

  if (data.privacyPolicy) positive.push('Politique de confidentialité trouvée.')
  else {
    score += 13
    reasons.push('Politique de confidentialité absente ou non vérifiée.')
  }

  if (data.rightsContact) positive.push('Moyen d’exercice des droits trouvé.')
  else {
    score += 10
    reasons.push('Aucun moyen clair d’exercer les droits n’est indiqué.')
  }

  if (data.cookiesInfo) positive.push('Information cookies / traceurs trouvée.')
  else {
    score += 7
    reasons.push('Information cookies / traceurs absente ou insuffisamment visible.')
  }

  if (data.entityName || data.entityIdentified) positive.push('Entité réelle déclarée sur le site.')
  else {
    score += 16
    reasons.push('Aucune société, association ou entité réelle clairement identifiée.')
  }

  if (data.registryMatch) {
    score -= 12
    positive.push('Entité indiquée comme vérifiable dans un registre officiel.')
  } else {
    score += 10
    reasons.push('Rattachement à un registre officiel non vérifié ou non indiqué.')
  }

  if (data.entityMismatch) {
    score += 34
    reasons.push('Incohérence déclarée entre site, société, SIREN/SIRET, adresse ou registre.')
  }

  if (data.paymentThirdParty) {
    score += 28
    reasons.push('Paiement ou destinataire économique déclaré comme différent de l’entité affichée.')
  }

  if (ssf.unsat > 0) {
    score += ssf.unsat * 9
    reasons.push(`${ssf.unsat} point(s) SSF-IRS en UNSAT.`)
  }

  if (ssf.unknown > 0) {
    score += Math.min(18, ssf.unknown * 3)
    reasons.push(`${ssf.unknown} point(s) SSF-IRS en UNKNOWN.`)
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
    score += 7
    reasons.push('Durées de conservation non identifiées.')
  }

  if (data.legalBasisInfo) positive.push('Bases juridiques indiquées.')
  else {
    score += 7
    reasons.push('Bases juridiques non identifiées.')
  }

  const finalScore = clamp(score, 0, 100)
  const label = gaugeLabel(finalScore)

  return {
    score: finalScore,
    percent: `${finalScore}%`,
    needleDegrees: 180 - (finalScore * 1.8),
    ...label,
    reasons,
    positive,
    ssf
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
  if (!data.entityName && !data.entityIdentified) missing.push('Société, association ou organisme responsable à identifier.')
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
  actions.push('Contrôler où chaque donnée est affichée sur le site : footer, mentions légales, confidentialité, CGV, contact ou paiement.')
  actions.push('Afficher les traces locales de cette interface pour comprendre ce qui reste dans le navigateur.')
  actions.push('Conserver les captures ou liens utiles avant toute démarche.')

  return {
    clear,
    missing,
    unclear,
    actions
  }
}

function svgEl(name, attributes = {}) {
  const node = document.createElementNS(SVG_NS, name)
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)))
  return node
}

function polarPoint(cx, cy, radius, degrees) {
  const radians = degrees * Math.PI / 180
  return {
    x: cx + Math.cos(radians) * radius,
    y: cy - Math.sin(radians) * radius
  }
}

function arcPath(cx, cy, radius, startDeg, endDeg) {
  const start = polarPoint(cx, cy, radius, startDeg)
  const end = polarPoint(cx, cy, radius, endDeg)
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
}

function renderGauge(gauge) {
  gaugeHost.innerHTML = ''

  const wrapper = document.createElement('section')
  wrapper.className = `gauge-card ${gauge.zone}`
  wrapper.setAttribute('aria-label', 'Compteur de vigilance documentaire')

  const visual = document.createElement('div')
  visual.className = 'gauge-visual'

  const svg = svgEl('svg', {
    viewBox: '0 0 240 150',
    role: 'img',
    'aria-label': `Compteur de vigilance : ${gauge.percent}, ${gauge.title}`
  })

  svg.append(
    svgEl('path', { class: 'gauge-track', d: arcPath(120, 118, 92, 180, 0) }),
    svgEl('path', { class: 'gauge-arc gauge-arc-green', d: arcPath(120, 118, 92, 180, 120) }),
    svgEl('path', { class: 'gauge-arc gauge-arc-yellow', d: arcPath(120, 118, 92, 120, 60) }),
    svgEl('path', { class: 'gauge-arc gauge-arc-red', d: arcPath(120, 118, 92, 60, 0) })
  )

  const needleEnd = polarPoint(120, 118, 78, gauge.needleDegrees)
  svg.append(
    svgEl('line', {
      class: 'gauge-needle',
      x1: 120,
      y1: 118,
      x2: needleEnd.x.toFixed(2),
      y2: needleEnd.y.toFixed(2)
    }),
    svgEl('circle', { class: 'gauge-hub', cx: 120, cy: 118, r: 9 }),
    svgEl('text', { class: 'gauge-text gauge-text-left', x: 35, y: 138 }),
    svgEl('text', { class: 'gauge-text gauge-text-mid', x: 120, y: 34 }),
    svgEl('text', { class: 'gauge-text gauge-text-right', x: 205, y: 138 })
  )

  const labels = svg.querySelectorAll('text')
  labels[0].textContent = 'Vert'
  labels[1].textContent = 'Jaune'
  labels[2].textContent = 'Rouge'

  const scorePill = document.createElement('div')
  scorePill.className = 'gauge-score-pill'
  scorePill.textContent = gauge.percent

  visual.append(svg, scorePill)

  const label = document.createElement('div')
  label.className = 'gauge-label'

  const title = document.createElement('strong')
  title.textContent = gauge.title

  const score = document.createElement('span')
  score.textContent = `Indice : ${gauge.percent}`

  const text = document.createElement('p')
  text.textContent = gauge.explanation

  const ssf = document.createElement('p')
  ssf.className = 'muted'
  ssf.textContent = `Pré-validation SSF-IRS : ${gauge.ssf.sat} SAT · ${gauge.ssf.unsat} UNSAT · ${gauge.ssf.unknown} UNKNOWN.`

  const reasons = document.createElement('p')
  reasons.className = 'muted'
  reasons.textContent = gauge.reasons.length
    ? `Pourquoi cette position : ${gauge.reasons.slice(0, 5).join(' ')}`
    : 'Pourquoi cette position : les principaux éléments déclarés sont cohérents dans cette lecture locale.'

  label.append(title, score, text, ssf, reasons)
  wrapper.append(visual, label)
  gaugeHost.append(wrapper)
}

function renderSsfSummary(rows) {
  ssfHost.innerHTML = ''
  const summary = summarizeSsf(rows)
  const panel = document.createElement('section')
  panel.className = 'ssf-panel'

  const title = document.createElement('h3')
  title.textContent = 'Pré-validation SSF-IRS'

  const intro = document.createElement('p')
  intro.className = 'muted'
  intro.textContent = 'Avant affichage interprété, les informations renseignées passent par une lecture publique SAT / UNSAT / UNKNOWN.'

  const badges = document.createElement('div')
  badges.className = 'status-row'

  const sat = document.createElement('span')
  sat.className = 'status-count sat'
  sat.textContent = `${summary.sat} SAT`

  const unsat = document.createElement('span')
  unsat.className = 'status-count unsat'
  unsat.textContent = `${summary.unsat} UNSAT`

  const unknown = document.createElement('span')
  unknown.className = 'status-count unknown'
  unknown.textContent = `${summary.unknown} UNKNOWN`

  badges.append(sat, unsat, unknown)
  panel.append(title, intro, badges)
  ssfHost.append(panel)
}

function renderEntityPanel(rows) {
  entityHost.innerHTML = ''

  const section = document.createElement('section')
  section.className = 'entity-panel'

  const title = document.createElement('h3')
  title.textContent = 'Entité identifiée / société rattachée'

  const intro = document.createElement('p')
  intro.className = 'muted'
  intro.textContent = 'Chaque information est affichée avec sa valeur, son emplacement sur le site audité, la source externe déclarée et son statut SSF-IRS.'

  const tableWrap = document.createElement('div')
  tableWrap.className = 'table-wrap'

  const table = document.createElement('table')
  const thead = document.createElement('thead')
  const headerRow = document.createElement('tr')
  ;['Donnée', 'Valeur', 'Où sur le site', 'Source externe', 'SSF-IRS', 'Lecture'].forEach(label => {
    const th = document.createElement('th')
    th.textContent = label
    headerRow.append(th)
  })
  thead.append(headerRow)

  const tbody = document.createElement('tbody')
  rows.forEach(row => {
    const tr = document.createElement('tr')
    const cells = [row.label, row.value, row.location, row.source]
    cells.forEach(value => {
      const td = document.createElement('td')
      td.textContent = value
      tr.append(td)
    })
    const statusCell = document.createElement('td')
    statusCell.append(makeBadge(row.status))
    const noteCell = document.createElement('td')
    noteCell.textContent = row.note
    tr.append(statusCell, noteCell)
    tbody.append(tr)
  })

  table.append(thead, tbody)
  tableWrap.append(table)
  section.append(title, intro, tableWrap)
  entityHost.append(section)
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

function snapshotForStorage(data, entityRows, gauge) {
  return {
    savedAt: new Date().toISOString(),
    explanation: 'Dernier audit local conservé uniquement dans ce navigateur pour affichage, reprise, export ou effacement par l’utilisateur.',
    data,
    ssfRows: entityRows.map(row => ({
      label: row.label,
      value: row.value,
      location: row.location,
      source: row.source,
      status: row.status,
      note: row.note
    })),
    vigilance: {
      score: gauge.score,
      percent: gauge.percent,
      zone: gauge.zone,
      title: gauge.title,
      reasons: gauge.reasons,
      ssf: gauge.ssf
    }
  }
}

function runAudit(data, options = {}) {
  const persist = options.persist !== false
  const entityRows = buildEntityRows(data)
  const gauge = buildGauge(data, entityRows)
  const reading = buildReading(data, gauge)
  renderGauge(gauge)
  renderSsfSummary(entityRows)
  renderEntityPanel(entityRows)
  renderReading(reading, data.target)

  if (persist) {
    writeLastAudit(snapshotForStorage(data, entityRows, gauge))
  }

  return { entityRows, gauge, reading }
}

function buildStorageInventory() {
  const log = readLog()
  const lastAudit = readLastAudit()
  return {
    explanation: 'Ces données sont celles que cette interface conserve dans le navigateur pour rendre le traitement visible et contrôlable.',
    storageLocation: 'localStorage du navigateur, pour cette adresse GitHub Pages uniquement.',
    automaticServerTransmission: false,
    keys: [
      {
        key: LOG_KEY,
        purpose: 'Journal local des actions utiles dans l’interface.',
        entries: log.length,
        visibleInInterface: true,
        exportable: true,
        erasable: true,
        value: log
      },
      {
        key: AUDIT_KEY,
        purpose: 'Dernier audit local pour reprise et vérification par l’utilisateur.',
        entries: lastAudit ? 1 : 0,
        visibleInInterface: true,
        exportable: true,
        erasable: true,
        value: lastAudit
      }
    ]
  }
}

function renderLocalStorageExplanation() {
  localStorageExplanation.hidden = false
  localStorageExplanation.innerHTML = ''

  const title = document.createElement('h3')
  title.textContent = 'Explication simple : carnet local du navigateur'

  const paragraphs = [
    'Cette interface peut écrire deux éléments dans votre navigateur : un journal des actions et le dernier audit local.',
    'Ces données restent sur l’appareil et le navigateur utilisés. Elles ne sont pas envoyées automatiquement à Muze-X, GitHub, Pappers, data.gouv ou un autre service par cette version.',
    'Le journal sert à montrer concrètement ce qu’une interface peut mémoriser localement : clics, audit généré, compteur affiché, export ou effacement.',
    'Le dernier audit local sert à reprendre une lecture déjà générée : site renseigné, informations société, SIREN/SIRET, emplacements, source indiquée, statuts SSF-IRS et compteur.',
    'Ces traces locales ne sont pas une preuve certifiée. Elles constituent une restitution contrôlable par l’utilisateur.'
  ]

  const listTitle = document.createElement('strong')
  listTitle.textContent = 'Contrôles disponibles'

  const list = document.createElement('ul')
  ;['Afficher ce qui est stocké', 'Exporter le journal JSON', 'Restaurer le dernier audit local', 'Effacer le journal', 'Effacer toutes les données locales de cette interface'].forEach(item => {
    const li = document.createElement('li')
    li.textContent = item
    list.append(li)
  })

  localStorageExplanation.append(title)
  paragraphs.forEach(text => {
    const p = document.createElement('p')
    p.textContent = text
    localStorageExplanation.append(p)
  })
  localStorageExplanation.append(listTitle, list)
}

function displayLocalStorageInventory() {
  const inventory = buildStorageInventory()
  storageOutput.textContent = JSON.stringify(inventory, null, 2)
}

form.addEventListener('submit', event => {
  event.preventDefault()
  const data = collectFormData()
  const { gauge } = runAudit(data)
  logAction('audit:local-reading-generated', {
    targetProvided: Boolean(data.target),
    target: data.target || null,
    checks: {
      legalNotice: data.legalNotice,
      privacyPolicy: data.privacyPolicy,
      cookiesInfo: data.cookiesInfo,
      rightsContact: data.rightsContact,
      entityIdentified: data.entityIdentified,
      registryMatch: data.registryMatch,
      entityMismatch: data.entityMismatch,
      paymentThirdParty: data.paymentThirdParty,
      localStorageObserved: data.localStorageObserved,
      externalServices: data.externalServices,
      retentionInfo: data.retentionInfo,
      legalBasisInfo: data.legalBasisInfo
    },
    entity: {
      entityName: data.entityName || null,
      legalForm: data.legalForm || null,
      sirenProvided: Boolean(data.siren),
      siretProvided: Boolean(data.siret),
      officialSource: data.officialSource || null
    },
    localStorage: {
      lastAuditSaved: true,
      storageKey: AUDIT_KEY
    },
    vigilance: {
      score: gauge.score,
      zone: gauge.zone,
      title: gauge.title,
      ssf: gauge.ssf
    }
  })
})

resetAudit.addEventListener('click', () => {
  form.reset()
  result.hidden = true
  gaugeHost.innerHTML = ''
  ssfHost.innerHTML = ''
  entityHost.innerHTML = ''
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

explainLocalStorage.addEventListener('click', () => {
  renderLocalStorageExplanation()
  logAction('local-storage:explanation-displayed')
})

showLocalStorage.addEventListener('click', () => {
  displayLocalStorageInventory()
  logAction('local-storage:inventory-displayed')
})

restoreLastAudit.addEventListener('click', () => {
  const snapshot = readLastAudit()
  if (!snapshot || !snapshot.data) {
    storageOutput.textContent = 'Aucun dernier audit local à restaurer.'
    logAction('local-storage:restore-empty')
    return
  }

  fillForm(snapshot.data)
  runAudit(snapshot.data, { persist: false })
  storageOutput.textContent = 'Dernier audit local restauré dans le formulaire et la restitution.'
  logAction('local-storage:last-audit-restored', {
    savedAt: snapshot.savedAt || null,
    storageKey: AUDIT_KEY
  })
})

clearAllLocalData.addEventListener('click', () => {
  localStorage.removeItem(LOG_KEY)
  localStorage.removeItem(AUDIT_KEY)
  logOutput.textContent = 'Journal local effacé.'
  storageOutput.textContent = 'Toutes les données locales de cette interface ont été effacées.'
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
