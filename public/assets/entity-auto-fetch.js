const AUTO_FETCH_OUTPUT_ID = 'auto-fetch-output'
const AUTO_FETCH_STATUS_ID = 'auto-fetch-status'
const SEARCH_API_BASE = 'https://recherche-entreprises.api.gouv.fr/search'

const autoFetchButton = document.querySelector('#auto-fetch-site')
const clearAutoFetchButton = document.querySelector('#clear-auto-fetch')
const autoFetchOutput = document.querySelector(`#${AUTO_FETCH_OUTPUT_ID}`)
const autoFetchStatus = document.querySelector(`#${AUTO_FETCH_STATUS_ID}`)

function autoSafeText(value, maxLength = 220) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function autoSetStatus(message) {
  if (autoFetchStatus) autoFetchStatus.textContent = message
}

function autoWriteOutput(payload) {
  if (!autoFetchOutput) return
  autoFetchOutput.textContent = typeof payload === 'string'
    ? payload
    : JSON.stringify(payload, null, 2)
}

function autoNormalizeUrl(value) {
  const trimmed = String(value || '').trim()
  if (!trimmed) throw new Error('URL absente.')
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  const url = new URL(candidate)
  if (url.protocol !== 'https:') throw new Error('Seules les URL HTTPS sont prises en charge dans cette version publique.')
  return url
}

function autoNormalizeDigits(value) {
  return String(value || '').replace(/\D+/g, '')
}

function autoSetField(id, value) {
  const node = document.querySelector(`#${id}`)
  if (node && value) node.value = value
}

function autoSetCheckbox(name, value) {
  const node = document.querySelector(`[name="${name}"]`)
  if (node) node.checked = Boolean(value)
}

function autoHumanLocation(label, pageUrl) {
  return pageUrl ? `${label} — ${pageUrl}` : label
}

function autoTextFromDocument(documentNode) {
  const clone = documentNode.cloneNode(true)
  clone.querySelectorAll('script, style, noscript, svg').forEach(node => node.remove())
  return autoSafeText(clone.body ? clone.body.textContent : clone.textContent, 50000)
}

function autoDetectLinks(baseUrl, documentNode) {
  const links = []
  documentNode.querySelectorAll('a[href]').forEach(anchor => {
    const label = autoSafeText(anchor.textContent || anchor.getAttribute('aria-label') || anchor.href, 160)
    const href = anchor.getAttribute('href')
    if (!href) return
    let resolved
    try {
      resolved = new URL(href, baseUrl).href
    } catch {
      return
    }
    const lower = `${label} ${resolved}`.toLowerCase()
    const type = lower.includes('mention') || lower.includes('legal') || lower.includes('légal')
      ? 'legal-notice'
      : lower.includes('confidential') || lower.includes('privacy') || lower.includes('données') || lower.includes('donnees')
        ? 'privacy-policy'
        : lower.includes('cookie') || lower.includes('traceur')
          ? 'cookies-info'
          : lower.includes('cgv') || lower.includes('conditions')
            ? 'terms'
            : lower.includes('contact') || lower.includes('dpo')
              ? 'contact'
              : null
    if (type) links.push({ type, label, href: resolved })
  })
  return links.slice(0, 12)
}

function autoExtractDigits(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const direct = new RegExp(`${escaped}[^0-9]{0,35}((?:\\d[\\s.\\-]?){9,14})`, 'i').exec(text)
  if (!direct) return ''
  return autoNormalizeDigits(direct[1])
}

function autoExtractIdentifiers(text) {
  const sirenDirect = autoExtractDigits(text, 'SIREN')
  const siretDirect = autoExtractDigits(text, 'SIRET')
  const siretGeneric = /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{5}\b/.exec(text)
  const sirenGeneric = /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{3}\b/.exec(text)

  const siret = autoNormalizeDigits(siretDirect || (siretGeneric ? siretGeneric[0] : ''))
  const siren = autoNormalizeDigits(sirenDirect || (siret ? siret.slice(0, 9) : (sirenGeneric ? sirenGeneric[0] : '')))

  return {
    siren: siren.length === 9 ? siren : '',
    siret: siret.length === 14 ? siret : ''
  }
}

function autoExtractEntityName(text, documentNode) {
  const metaSiteName = documentNode.querySelector('meta[property="og:site_name"], meta[name="application-name"]')
  const metaValue = metaSiteName ? autoSafeText(metaSiteName.getAttribute('content'), 120) : ''
  const patterns = [
    /(?:dénomination|denomination|raison sociale|éditeur|editeur|société éditrice|societe editrice)\s*[:\-–]\s*([^\n.;]{3,120})/i,
    /(?:société|societe)\s+([A-Z0-9][A-Z0-9 '&.,\-]{2,120})/,
    /(?:exploité par|exploite par|édité par|edite par)\s+([^\n.;]{3,120})/i
  ]
  for (const pattern of patterns) {
    const match = pattern.exec(text)
    if (match) return autoSafeText(match[1], 120)
  }
  return metaValue
}

function autoExtractLegalForm(text) {
  const match = /\b(SASU?|SARL|EURL|SA|SCI|SCOP|SELARL|EI|EIRL|Association loi 1901|Association)\b/i.exec(text)
  return match ? match[1].toUpperCase() : ''
}

function autoExtractAddress(text) {
  const match = /\b\d{1,4}\s+[A-Za-zÀ-ÿ0-9'’ .\-]+\s+(?:rue|avenue|av\.?|boulevard|bd|chemin|route|impasse|place|allée|allee)[^\n]{0,90}\b\d{5}\s+[A-Za-zÀ-ÿ'’ .\-]+/i.exec(text)
    || /\b\d{5}\s+[A-Za-zÀ-ÿ'’ .\-]{2,80}\b/.exec(text)
  return match ? autoSafeText(match[0], 180) : ''
}

function autoExtractRightsLocation(links) {
  const privacy = links.find(link => link.type === 'privacy-policy')
  const contact = links.find(link => link.type === 'contact')
  if (privacy) return autoHumanLocation('Politique de confidentialité', privacy.href)
  if (contact) return autoHumanLocation('Contact / DPO', contact.href)
  return ''
}

async function autoFetchHtml(url) {
  const response = await fetch(url.href, {
    method: 'GET',
    credentials: 'omit',
    redirect: 'follow',
    mode: 'cors'
  })
  if (!response.ok) throw new Error(`Réponse HTTP ${response.status}`)
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) throw new Error(`Contenu non HTML : ${contentType || 'type inconnu'}`)
  return response.text()
}

async function autoSearchRegistry({ siren, siret, entityName }) {
  const query = siren ? `siren:${siren}` : siret ? `siret:${siret}` : entityName
  if (!query) return { query: '', results: [], selected: null, error: 'Aucun identifiant ou nom exploitable.' }

  try {
    const url = new URL(SEARCH_API_BASE)
    url.searchParams.set('q', query)
    url.searchParams.set('per_page', '5')
    const response = await fetch(url.href, { method: 'GET', credentials: 'omit', mode: 'cors' })
    if (!response.ok) throw new Error(`Réponse API ${response.status}`)
    const payload = await response.json()
    const results = Array.isArray(payload.results) ? payload.results : []
    return { query, results, selected: results[0] || null, error: '' }
  } catch (error) {
    return { query, results: [], selected: null, error: error.message || 'API indisponible.' }
  }
}

function autoFirstValue(object, keys) {
  for (const key of keys) {
    if (object && object[key] !== undefined && object[key] !== null && object[key] !== '') return object[key]
  }
  return ''
}

function autoMapRegistryEntity(result) {
  if (!result) return {}
  const siege = result.siege || result.etablissement_siege || {}
  return {
    name: autoSafeText(autoFirstValue(result, ['nom_complet', 'nom_raison_sociale', 'denomination', 'nom']), 180),
    siren: autoNormalizeDigits(autoFirstValue(result, ['siren'])),
    siret: autoNormalizeDigits(autoFirstValue(result, ['siret']) || autoFirstValue(siege, ['siret'])),
    legalForm: autoSafeText(autoFirstValue(result, ['nature_juridique', 'forme_juridique', 'categorie_entreprise']), 120),
    naf: autoSafeText(autoFirstValue(result, ['activite_principale', 'code_naf']) || autoFirstValue(siege, ['activite_principale', 'code_naf']), 80),
    address: autoSafeText(autoFirstValue(result, ['adresse']) || autoFirstValue(siege, ['adresse']), 220)
  }
}

function autoApplyExtraction({ extraction, registry }) {
  const registryEntity = autoMapRegistryEntity(registry.selected)
  const sourceLabel = registry.selected
    ? `API Recherche d’Entreprises — ${registry.query}`
    : registry.error
      ? `API Recherche d’Entreprises — non validé (${registry.error})`
      : 'API Recherche d’Entreprises — aucun résultat'

  autoSetField('entity-name', registryEntity.name || extraction.entityName)
  autoSetField('legal-form', registryEntity.legalForm || extraction.legalForm)
  autoSetField('siren', registryEntity.siren || extraction.siren)
  autoSetField('siret', registryEntity.siret || extraction.siret)
  autoSetField('entity-address', registryEntity.address || extraction.address)
  autoSetField('official-source', sourceLabel)

  autoSetField('entity-location', extraction.entityLocation)
  autoSetField('siren-location', extraction.siren ? extraction.sirenLocation : '')
  autoSetField('siret-location', extraction.siret ? extraction.siretLocation : '')
  autoSetField('address-location', extraction.address ? extraction.addressLocation : '')
  autoSetField('rights-location', extraction.rightsLocation)

  autoSetCheckbox('legal-notice', extraction.hasLegalNotice)
  autoSetCheckbox('privacy-policy', extraction.hasPrivacyPolicy)
  autoSetCheckbox('cookies-info', extraction.hasCookiesInfo)
  autoSetCheckbox('rights-contact', extraction.hasRightsContact)
  autoSetCheckbox('entity-identified', Boolean(extraction.entityName || extraction.siren || extraction.siret || registryEntity.name))
  autoSetCheckbox('registry-match', Boolean(registry.selected))
  autoSetCheckbox('entity-mismatch', false)

  const form = document.querySelector('#audit-form')
  if (form && typeof form.requestSubmit === 'function') form.requestSubmit()
}

function autoBuildExtraction(pageUrl, html) {
  const parser = new DOMParser()
  const documentNode = parser.parseFromString(html, 'text/html')
  const text = autoTextFromDocument(documentNode)
  const links = autoDetectLinks(pageUrl, documentNode)
  const identifiers = autoExtractIdentifiers(text)
  const legalLink = links.find(link => link.type === 'legal-notice')
  const privacyLink = links.find(link => link.type === 'privacy-policy')
  const cookiesLink = links.find(link => link.type === 'cookies-info')
  const contactLink = links.find(link => link.type === 'contact')

  return {
    pageUrl: pageUrl.href,
    fetchedBytes: html.length,
    hasLegalNotice: Boolean(legalLink || /mentions légales|mentions legales|éditeur|editeur|hébergeur|hebergeur/i.test(text)),
    hasPrivacyPolicy: Boolean(privacyLink || /politique de confidentialité|politique de confidentialite|privacy policy|données personnelles|donnees personnelles/i.test(text)),
    hasCookiesInfo: Boolean(cookiesLink || /cookies?|traceurs?/i.test(text)),
    hasRightsContact: Boolean(contactLink || /droit d'accès|droit d’acces|rectification|effacement|opposition|dpo|protection des données/i.test(text)),
    entityName: autoExtractEntityName(text, documentNode),
    legalForm: autoExtractLegalForm(text),
    siren: identifiers.siren,
    siret: identifiers.siret,
    address: autoExtractAddress(text),
    entityLocation: legalLink ? autoHumanLocation('Mentions légales', legalLink.href) : 'Page lue automatiquement',
    sirenLocation: legalLink ? autoHumanLocation('Mentions légales', legalLink.href) : 'Page lue automatiquement',
    siretLocation: legalLink ? autoHumanLocation('Mentions légales', legalLink.href) : 'Page lue automatiquement',
    addressLocation: legalLink ? autoHumanLocation('Mentions légales', legalLink.href) : 'Page lue automatiquement',
    rightsLocation: autoExtractRightsLocation(links),
    links
  }
}

async function runAutoFetch() {
  const input = document.querySelector('#target-url')
  autoFetchOutput.hidden = false
  autoSetStatus('Récupération lancée par l’utilisateur...')
  autoWriteOutput('Lecture du site demandé...')

  try {
    const pageUrl = autoNormalizeUrl(input ? input.value : '')
    if (input) input.value = pageUrl.href

    const html = await autoFetchHtml(pageUrl)
    const extraction = autoBuildExtraction(pageUrl, html)
    autoSetStatus('Site lu. Recherche registre en cours...')

    const registry = await autoSearchRegistry(extraction)
    autoApplyExtraction({ extraction, registry })

    const report = {
      mode: 'user-triggered-auto-fetch-v0.2',
      site: pageUrl.href,
      siteFetch: 'SAT',
      registryFetch: registry.selected ? 'SAT' : 'UNKNOWN',
      corsNote: 'Si le site refuse la lecture depuis le navigateur, cette étape bascule en mode manuel.',
      extraction,
      registry: {
        query: registry.query,
        error: registry.error,
        resultCount: registry.results.length,
        selected: autoMapRegistryEntity(registry.selected)
      }
    }

    autoWriteOutput(report)
    autoSetStatus('Préremplissage terminé. La lecture locale a été régénérée.')
    if (typeof logAction === 'function') logAction('auto-fetch:completed', { site: pageUrl.href, registryStatus: report.registryFetch })
  } catch (error) {
    const message = error.message || 'Erreur inconnue.'
    autoSetStatus('Récupération automatique impossible. Mode manuel conservé.')
    autoWriteOutput({
      mode: 'user-triggered-auto-fetch-v0.2',
      siteFetch: 'UNKNOWN',
      reason: message,
      userExplanation: 'Le navigateur peut empêcher la lecture d’un site externe si le site ne l’autorise pas par ses en-têtes CORS. Les champs manuels restent disponibles.'
    })
    if (typeof logAction === 'function') logAction('auto-fetch:blocked-or-failed', { reason: message })
  }
}

if (autoFetchButton) {
  autoFetchButton.addEventListener('click', runAutoFetch)
}

if (clearAutoFetchButton) {
  clearAutoFetchButton.addEventListener('click', () => {
    autoSetStatus('Résultat automatique effacé. Les champs restent modifiables manuellement.')
    autoWriteOutput('Aucune récupération affichée.')
    if (typeof logAction === 'function') logAction('auto-fetch:output-cleared')
  })
}
