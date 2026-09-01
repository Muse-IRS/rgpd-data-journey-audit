const AUTO_FETCH_OUTPUT_ID = 'auto-fetch-output'
const AUTO_FETCH_STATUS_ID = 'auto-fetch-status'
const AUTO_LOOKUP_KEY = 'rgpd-data-journey-audit:last-public-entity-lookup'
const SEARCH_API_BASE = 'https://recherche-entreprises.api.gouv.fr/search'

const autoFetchButton = document.querySelector('#auto-fetch-site')
const buildPublicLinksButton = document.querySelector('#build-public-links')
const importPublicTextButton = document.querySelector('#import-public-text')
const clearAutoFetchButton = document.querySelector('#clear-auto-fetch')
const autoFetchOutput = document.querySelector(`#${AUTO_FETCH_OUTPUT_ID}`)
const autoFetchStatus = document.querySelector(`#${AUTO_FETCH_STATUS_ID}`)
const publicEntityQuery = document.querySelector('#public-entity-query')
const publicEntityImport = document.querySelector('#public-entity-import')

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

function autoMaybeUrl(value) {
  const trimmed = String(value || '').trim()
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) return null
  try {
    return new URL(trimmed)
  } catch {
    return null
  }
}

function autoNormalizeTargetUrl(value) {
  const trimmed = String(value || '').trim()
  if (!trimmed) throw new Error('URL absente.')
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  const url = new URL(candidate)
  if (url.protocol !== 'https:') throw new Error('Seules les URL HTTPS sont prises en charge dans cette version publique.')
  return url
}

function autoDomainHint(url) {
  if (!url || !url.hostname) return ''
  return url.hostname
    .replace(/^www\./i, '')
    .split('.')
    .slice(0, -1)
    .join(' ')
    .replace(/[-_]+/g, ' ')
    .trim()
}

function autoSlug(value) {
  return autoSafeText(value, 180)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function autoExtractIdentifiers(text) {
  const source = String(text || '')
  const siretDirect = /\bSIRET\D{0,35}((?:\d[\s.\-]?){14})\b/i.exec(source)
  const sirenDirect = /\bSIREN\D{0,35}((?:\d[\s.\-]?){9})\b/i.exec(source)
  const siretGeneric = /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{5}\b/.exec(source)
  const sirenGeneric = /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{3}\b/.exec(source)
  const siret = autoNormalizeDigits(siretDirect ? siretDirect[1] : (siretGeneric ? siretGeneric[0] : ''))
  const siren = autoNormalizeDigits(sirenDirect ? sirenDirect[1] : (siret ? siret.slice(0, 9) : (sirenGeneric ? sirenGeneric[0] : '')))

  return {
    siren: siren.length === 9 ? siren : '',
    siret: siret.length === 14 ? siret : ''
  }
}

function autoExtractEntityName(text, documentNode = null) {
  const source = String(text || '')
  const metaSiteName = documentNode
    ? documentNode.querySelector('meta[property="og:site_name"], meta[name="application-name"]')
    : null
  const metaValue = metaSiteName ? autoSafeText(metaSiteName.getAttribute('content'), 120) : ''
  const patterns = [
    /société\s+([A-ZÀ-Ÿ0-9][A-ZÀ-Ÿ0-9 '&.,\-]{2,80})\s+est\s+une/i,
    /société\s+([A-ZÀ-Ÿ0-9][A-ZÀ-Ÿ0-9 '&.,\-]{2,80})\s*\(/i,
    /(?:dénomination|denomination|raison sociale|éditeur|editeur|société éditrice|societe editrice)\s*[:\-–]\s*([^\n.;]{3,120})/i,
    /(?:exploité par|exploite par|édité par|edite par)\s+([^\n.;]{3,120})/i,
    /\b([A-ZÀ-Ÿ][A-ZÀ-Ÿ0-9 '&.,\-]{2,60})\s+\([0-9]{9}\)/
  ]

  for (const pattern of patterns) {
    const match = pattern.exec(source)
    if (match) return autoSafeText(match[1], 120)
  }
  return metaValue
}

function autoExtractLegalForm(text) {
  const match = /\b(SASU?|SARL|EURL|SA|SCI|SCOP|SELARL|EI|EIRL|Association loi 1901|Association)\b/i.exec(String(text || ''))
  return match ? match[1].toUpperCase() : ''
}

function autoExtractAddress(text) {
  const source = String(text || '')
  const match = /\b\d{1,4}\s+[A-Za-zÀ-ÿ0-9'’ .\-]+\s+(?:rue|avenue|av\.?|boulevard|bd|chemin|route|impasse|place|allée|allee)[^\n]{0,90}\b\d{5}\s+[A-Za-zÀ-ÿ'’ .\-]+/i.exec(source)
    || /\b\d{5}\s+[A-Za-zÀ-ÿ'’ .\-]{2,80}\b/.exec(source)
  return match ? autoSafeText(match[0], 180) : ''
}

function autoExtractActivity(text) {
  const source = String(text || '')
  const naf = /\b(?:NAF|APE)\D{0,20}([0-9]{2}\.?[0-9]{2}[A-Z])\b/i.exec(source)
  const activity = /(?:activité principale déclarée|activite principale declaree|spécialisée dans|specialisee dans)\s*[:\-–]?\s*([^\n.;]{8,180})/i.exec(source)
  return {
    naf: naf ? naf[1].toUpperCase().replace('.', '') : '',
    activity: activity ? autoSafeText(activity[1], 180) : ''
  }
}

function autoQueryFromAnnuaireUrl(url) {
  const match = /\/(?:etablissement|entreprise)\/(\d{9,14})/i.exec(url.pathname)
  if (!match) return null
  const digits = autoNormalizeDigits(match[1])
  return {
    query: digits,
    queryType: digits.length === 14 ? 'SIRET' : 'SIREN',
    source: 'annuaire-url'
  }
}

function autoQueryFromPappersUrl(url) {
  const search = url.searchParams.get('q') || url.searchParams.get('recherche')
  if (search) {
    return { query: autoSafeText(search, 180), queryType: 'entity_name', source: 'pappers-search-url' }
  }
  const last = url.pathname.split('/').filter(Boolean).pop() || ''
  const digits = autoNormalizeDigits(last)
  if (digits.length === 9 || digits.length === 14) {
    return { query: digits, queryType: digits.length === 14 ? 'SIRET' : 'SIREN', source: 'pappers-url' }
  }
  const cleaned = last
    .replace(/-\d{9,14}$/g, '')
    .replace(/[-_]+/g, ' ')
    .trim()
  return cleaned ? { query: autoSafeText(cleaned, 180), queryType: 'entity_name', source: 'pappers-url' } : null
}

function autoBuildLookupSeed() {
  const queryText = autoSafeText(publicEntityQuery ? publicEntityQuery.value : '', 220)
  const targetInput = document.querySelector('#target-url')
  const targetText = autoSafeText(targetInput ? targetInput.value : '', 220)
  const raw = queryText || targetText

  if (!raw) throw new Error('Renseigner une URL auditée, un nom, un SIREN, un SIRET ou un lien public.')

  const maybeUrl = autoMaybeUrl(raw)
  if (maybeUrl && maybeUrl.hostname.includes('annuaire-entreprises.data.gouv.fr')) {
    const fromAnnuaire = autoQueryFromAnnuaireUrl(maybeUrl)
    if (fromAnnuaire) return { ...fromAnnuaire, raw, pageUrl: maybeUrl.href }
  }
  if (maybeUrl && maybeUrl.hostname.includes('pappers.fr')) {
    const fromPappers = autoQueryFromPappersUrl(maybeUrl)
    if (fromPappers) return { ...fromPappers, raw, pageUrl: maybeUrl.href }
  }

  const identifiers = autoExtractIdentifiers(raw)
  if (identifiers.siret) return { query: identifiers.siret, queryType: 'SIRET', source: 'typed-siret', raw }
  if (identifiers.siren) return { query: identifiers.siren, queryType: 'SIREN', source: 'typed-siren', raw }
  if (maybeUrl) return { query: autoDomainHint(maybeUrl), queryType: 'domain_hint', source: 'target-url-domain', raw, pageUrl: maybeUrl.href }

  return { query: raw.replace(/^pappers\//i, '').trim(), queryType: 'entity_name', source: 'typed-public-query', raw }
}

function autoPublicLookupLinks(seed) {
  const query = autoSafeText(seed.query || '', 180)
  const apiUrl = new URL(SEARCH_API_BASE)
  apiUrl.searchParams.set('q', query)
  apiUrl.searchParams.set('per_page', '5')

  const annuaireSearchUrl = new URL('https://annuaire-entreprises.data.gouv.fr/rechercher')
  annuaireSearchUrl.searchParams.set('terme', query)

  const pappersSearchUrl = new URL('https://www.pappers.fr/recherche')
  pappersSearchUrl.searchParams.set('q', query)

  const googlePappersUrl = new URL('https://www.google.com/search')
  googlePappersUrl.searchParams.set('q', `site:pappers.fr ${query}`)

  const links = [
    {
      key: 'recherche-entreprises-api',
      label: 'API Recherche d’Entreprises',
      type: 'open_api_no_account_no_token',
      url: apiUrl.href
    },
    {
      key: 'annuaire-entreprises-web',
      label: 'Annuaire Entreprises',
      type: 'public_web_no_account_no_token',
      url: annuaireSearchUrl.href
    },
    {
      key: 'pappers-public-web',
      label: 'Pappers public',
      type: 'public_web_no_account_no_token',
      url: pappersSearchUrl.href
    },
    {
      key: 'google-pappers-locator',
      label: 'Google → Pappers',
      type: 'public_locator_no_account_no_token',
      url: googlePappersUrl.href
    }
  ]

  const digits = autoNormalizeDigits(query)
  if (digits.length === 14) {
    links.unshift({
      key: 'annuaire-etablissement-direct',
      label: 'Annuaire établissement direct',
      type: 'public_web_no_account_no_token',
      url: `https://annuaire-entreprises.data.gouv.fr/etablissement/${digits}`
    })
  }

  return links
}

function autoEnsureLinksHost() {
  let host = document.querySelector('#auto-fetch-links')
  if (host) return host
  host = document.createElement('div')
  host.id = 'auto-fetch-links'
  host.className = 'auto-fetch-links actions'
  if (autoFetchOutput && autoFetchOutput.parentNode) {
    autoFetchOutput.parentNode.insertBefore(host, autoFetchOutput)
  }
  return host
}

function autoRenderLinks(links) {
  const host = autoEnsureLinksHost()
  if (!host) return
  host.innerHTML = ''
  links.forEach(link => {
    const anchor = document.createElement('a')
    anchor.className = 'button secondary'
    anchor.href = link.url
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
    anchor.textContent = link.label
    host.append(anchor)
  })
}

function autoSaveLookup(snapshot) {
  try {
    localStorage.setItem(AUTO_LOOKUP_KEY, JSON.stringify(snapshot))
  } catch {
    // Local storage can be blocked by browser settings.
  }
}

async function autoSearchRegistry(seed) {
  const links = autoPublicLookupLinks(seed)
  const apiLink = links.find(link => link.key === 'recherche-entreprises-api')

  try {
    const response = await fetch(apiLink.url, { method: 'GET', credentials: 'omit', mode: 'cors' })
    if (!response.ok) throw new Error(`Réponse API ${response.status}`)
    const payload = await response.json()
    const results = Array.isArray(payload.results) ? payload.results : []
    return {
      query: seed.query,
      queryType: seed.queryType,
      requestUrl: apiLink.url,
      publicLookupLinks: links,
      results,
      selected: results[0] || null,
      error: ''
    }
  } catch (error) {
    return {
      query: seed.query,
      queryType: seed.queryType,
      requestUrl: apiLink ? apiLink.url : '',
      publicLookupLinks: links,
      results: [],
      selected: null,
      error: error.message || 'API indisponible.'
    }
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
    address: autoSafeText(autoFirstValue(result, ['adresse']) || autoFirstValue(siege, ['adresse']), 220),
    administrativeState: autoSafeText(autoFirstValue(result, ['etat_administratif', 'etat_administratif_unite_legale']) || autoFirstValue(siege, ['etat_administratif']), 80)
  }
}

function autoApplyExtraction({ extraction, registry, sourceLabel }) {
  const registryEntity = autoMapRegistryEntity(registry.selected)
  const finalSourceLabel = registry.selected
    ? `API Recherche d’Entreprises — ${registry.query}`
    : sourceLabel || (registry.error
      ? `Source publique — non validée automatiquement (${registry.error})`
      : 'Source publique — aucun résultat API')

  autoSetField('entity-name', registryEntity.name || extraction.entityName)
  autoSetField('legal-form', registryEntity.legalForm || extraction.legalForm)
  autoSetField('siren', registryEntity.siren || extraction.siren)
  autoSetField('siret', registryEntity.siret || extraction.siret)
  autoSetField('entity-address', registryEntity.address || extraction.address)
  autoSetField('official-source', finalSourceLabel)

  autoSetField('entity-location', extraction.entityLocation)
  autoSetField('siren-location', extraction.siren ? extraction.sirenLocation : '')
  autoSetField('siret-location', extraction.siret ? extraction.siretLocation : '')
  autoSetField('address-location', extraction.address ? extraction.addressLocation : '')
  autoSetField('rights-location', extraction.rightsLocation)

  autoSetCheckbox('entity-identified', Boolean(extraction.entityName || extraction.siren || extraction.siret || registryEntity.name))
  autoSetCheckbox('registry-match', Boolean(registry.selected))
  autoSetCheckbox('entity-mismatch', false)

  const form = document.querySelector('#audit-form')
  if (form && typeof form.requestSubmit === 'function') form.requestSubmit()
}

function autoExtractionFromImportedText(text) {
  const identifiers = autoExtractIdentifiers(text)
  const activity = autoExtractActivity(text)
  return {
    pageUrl: 'Texte public collé par l’utilisateur',
    sourcePages: [{ label: 'Import public collé', pageUrl: 'navigateur', fetchedBytes: text.length }],
    hasLegalNotice: /mentions légales|mentions legales|éditeur|editeur|hébergeur|hebergeur/i.test(text),
    hasPrivacyPolicy: /politique de confidentialité|politique de confidentialite|données personnelles|donnees personnelles|privacy/i.test(text),
    hasCookiesInfo: /cookies?|traceurs?/i.test(text),
    hasRightsContact: /droit d'accès|droit d’acces|rectification|effacement|opposition|dpo|protection des données/i.test(text),
    entityName: autoExtractEntityName(text),
    legalForm: autoExtractLegalForm(text),
    siren: identifiers.siren,
    siret: identifiers.siret,
    address: autoExtractAddress(text),
    activity: activity.activity,
    naf: activity.naf,
    entityLocation: 'Résultat public collé : Pappers / Annuaire / Google / mentions légales',
    sirenLocation: identifiers.siren ? 'Résultat public collé' : '',
    siretLocation: identifiers.siret ? 'Résultat public collé' : '',
    addressLocation: autoExtractAddress(text) ? 'Résultat public collé' : '',
    rightsLocation: '',
    links: [],
    extractedSamples: [{ label: 'Import public', pageUrl: 'collage utilisateur', sample: autoSafeText(text, 700) }]
  }
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
    if (type && !links.some(link => link.href === resolved)) links.push({ type, label, href: resolved })
  })
  return links.slice(0, 20)
}

async function autoFetchHtml(url) {
  const startedAt = new Date().toISOString()
  const request = {
    method: 'GET',
    url: url.href,
    mode: 'cors',
    credentials: 'omit',
    redirect: 'follow',
    startedAt
  }

  const response = await fetch(url.href, {
    method: request.method,
    credentials: request.credentials,
    redirect: request.redirect,
    mode: request.mode
  })

  const result = {
    ...request,
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get('content-type') || '',
    completedAt: new Date().toISOString()
  }

  if (!response.ok) {
    const error = new Error(`Réponse HTTP ${response.status}`)
    error.request = result
    throw error
  }

  if (!result.contentType.includes('text/html')) {
    const error = new Error(`Contenu non HTML : ${result.contentType || 'type inconnu'}`)
    error.request = result
    throw error
  }

  return { html: await response.text(), request: result }
}

function autoBuildPageExtraction(pageUrl, html, label) {
  const parser = new DOMParser()
  const documentNode = parser.parseFromString(html, 'text/html')
  const text = autoTextFromDocument(documentNode)
  const links = autoDetectLinks(pageUrl, documentNode)
  const imported = autoExtractionFromImportedText(text)

  return {
    ...imported,
    label,
    pageUrl: pageUrl.href,
    fetchedBytes: html.length,
    links,
    entityLocation: imported.entityName ? autoHumanLocation(label, pageUrl.href) : 'Page lue automatiquement',
    sirenLocation: imported.siren ? autoHumanLocation(label, pageUrl.href) : '',
    siretLocation: imported.siret ? autoHumanLocation(label, pageUrl.href) : '',
    addressLocation: imported.address ? autoHumanLocation(label, pageUrl.href) : '',
    extractedSamples: [{ label, pageUrl: pageUrl.href, sample: autoSafeText(text, 700) }]
  }
}

function autoPickFirst(pages, key) {
  const found = pages.find(page => page[key])
  return found ? found[key] : ''
}

function autoPickLocation(pages, key, fallbackLabel) {
  const found = pages.find(page => page[key])
  return found ? autoHumanLocation(found.label, found.pageUrl) : fallbackLabel
}

function autoExtractRightsLocation(links) {
  const privacy = links.find(link => link.type === 'privacy-policy')
  const contact = links.find(link => link.type === 'contact')
  if (privacy) return autoHumanLocation('Politique de confidentialité', privacy.href)
  if (contact) return autoHumanLocation('Contact / DPO', contact.href)
  return ''
}

function autoMergeExtractions(pageUrl, pages) {
  const allLinks = pages.flatMap(page => page.links || [])
  const uniqueLinks = []
  allLinks.forEach(link => {
    if (!uniqueLinks.some(item => item.href === link.href)) uniqueLinks.push(link)
  })

  const legalLink = uniqueLinks.find(link => link.type === 'legal-notice')

  return {
    pageUrl: pageUrl.href,
    sourcePages: pages.map(page => ({ label: page.label, pageUrl: page.pageUrl, fetchedBytes: page.fetchedBytes })),
    hasLegalNotice: Boolean(legalLink || pages.some(page => page.hasLegalNotice)),
    hasPrivacyPolicy: pages.some(page => page.hasPrivacyPolicy),
    hasCookiesInfo: pages.some(page => page.hasCookiesInfo),
    hasRightsContact: pages.some(page => page.hasRightsContact),
    entityName: autoPickFirst(pages, 'entityName'),
    legalForm: autoPickFirst(pages, 'legalForm'),
    siren: autoPickFirst(pages, 'siren'),
    siret: autoPickFirst(pages, 'siret'),
    address: autoPickFirst(pages, 'address'),
    activity: autoPickFirst(pages, 'activity'),
    naf: autoPickFirst(pages, 'naf'),
    entityLocation: autoPickLocation(pages, 'entityName', legalLink ? autoHumanLocation('Mentions légales', legalLink.href) : 'Page lue automatiquement'),
    sirenLocation: autoPickLocation(pages, 'siren', legalLink ? autoHumanLocation('Mentions légales', legalLink.href) : 'Page lue automatiquement'),
    siretLocation: autoPickLocation(pages, 'siret', legalLink ? autoHumanLocation('Mentions légales', legalLink.href) : 'Page lue automatiquement'),
    addressLocation: autoPickLocation(pages, 'address', legalLink ? autoHumanLocation('Mentions légales', legalLink.href) : 'Page lue automatiquement'),
    rightsLocation: autoExtractRightsLocation(uniqueLinks),
    links: uniqueLinks.slice(0, 20),
    extractedSamples: pages.flatMap(page => page.extractedSamples || [])
  }
}

function autoUsefulSameOriginLinks(pageUrl, links) {
  const priority = ['legal-notice', 'privacy-policy', 'terms', 'contact', 'cookies-info']
  return links
    .filter(link => priority.includes(link.type))
    .filter(link => {
      try {
        const linkUrl = new URL(link.href)
        return linkUrl.origin === pageUrl.origin
      } catch {
        return false
      }
    })
    .sort((a, b) => priority.indexOf(a.type) - priority.indexOf(b.type))
    .slice(0, 5)
}

async function autoBuildExtraction(pageUrl, firstHtml, firstRequest) {
  const pageRequests = [firstRequest]
  const pageExtractions = [autoBuildPageExtraction(pageUrl, firstHtml, 'Page principale')]
  const usefulLinks = autoUsefulSameOriginLinks(pageUrl, pageExtractions[0].links)

  for (const link of usefulLinks) {
    try {
      const nextUrl = new URL(link.href)
      const fetched = await autoFetchHtml(nextUrl)
      pageRequests.push(fetched.request)
      pageExtractions.push(autoBuildPageExtraction(nextUrl, fetched.html, link.type))
    } catch (error) {
      pageRequests.push({
        method: 'GET',
        url: link.href,
        mode: 'cors',
        credentials: 'omit',
        ok: false,
        status: 'UNKNOWN',
        error: error.message || 'Lecture impossible'
      })
    }
  }

  const merged = autoMergeExtractions(pageUrl, pageExtractions)
  return { ...merged, pageRequests }
}

function autoMinimalDataScope() {
  return [
    'dénomination',
    'forme juridique',
    'SIREN',
    'SIRET',
    'adresse',
    'activité / NAF',
    'état administratif simple',
    'source',
    'emplacement trouvé'
  ]
}

function autoExcludedDataScope() {
  return [
    'bénéfices',
    'chiffre d’affaires',
    'comptes annuels',
    'bilans',
    'documents dirigeants détaillés',
    'bénéficiaires effectifs'
  ]
}

function autoBuildDiagnostic({ seed, links, registry, extraction = null, siteRequest = null, mode }) {
  return {
    mode,
    policy: 'NO_ACCOUNT_NO_TOKEN_PUBLIC_IDENTITY_ONLY',
    lookupSource: seed.source,
    query: seed.query,
    queryType: seed.queryType,
    rawInput: seed.raw,
    dataScope: autoMinimalDataScope(),
    excludedData: autoExcludedDataScope(),
    requests: {
      siteRequests: extraction && extraction.pageRequests ? extraction.pageRequests : siteRequest ? [siteRequest] : [],
      registryRequest: registry ? {
        method: 'GET',
        url: registry.requestUrl,
        query: registry.query,
        queryType: registry.queryType,
        credentials: 'omit',
        accountRequired: false,
        tokenRequired: false
      } : null,
      publicLookupLinks: links
    },
    extraction,
    registry: registry ? {
      query: registry.query,
      queryType: registry.queryType,
      requestUrl: registry.requestUrl,
      error: registry.error,
      resultCount: registry.results.length,
      selected: autoMapRegistryEntity(registry.selected)
    } : null
  }
}

function buildPublicLinksOnly() {
  try {
    const seed = autoBuildLookupSeed()
    const links = autoPublicLookupLinks(seed)
    const snapshot = {
      at: new Date().toISOString(),
      mode: 'public-links-only',
      policy: 'NO_ACCOUNT_NO_TOKEN_PUBLIC_IDENTITY_ONLY',
      query: seed.query,
      queryType: seed.queryType,
      links
    }
    autoRenderLinks(links)
    autoWriteOutput(snapshot)
    autoSaveLookup(snapshot)
    autoSetStatus('Liens publics construits. Ouvrir Pappers / Annuaire, copier le résultat visible, puis utiliser l’import par collage.')
    if (typeof logAction === 'function') logAction('auto-fetch:public-links-built', { query: seed.query, queryType: seed.queryType })
  } catch (error) {
    autoSetStatus('Impossible de construire les liens publics.')
    autoWriteOutput({ reason: error.message || 'Erreur inconnue.' })
  }
}

async function importPublicText() {
  const text = String(publicEntityImport ? publicEntityImport.value : '').trim()
  if (!text) {
    autoSetStatus('Aucun texte public collé à importer.')
    autoWriteOutput({ reason: 'Coller un extrait Pappers, Annuaire, Google ou mentions légales.' })
    return
  }

  const extraction = autoExtractionFromImportedText(text)
  const seed = extraction.siret
    ? { query: extraction.siret, queryType: 'SIRET', source: 'pasted-public-text', raw: text }
    : extraction.siren
      ? { query: extraction.siren, queryType: 'SIREN', source: 'pasted-public-text', raw: text }
      : extraction.entityName
        ? { query: extraction.entityName, queryType: 'entity_name', source: 'pasted-public-text', raw: text }
        : { query: autoSafeText(text, 80), queryType: 'pasted_text', source: 'pasted-public-text', raw: text }

  const links = autoPublicLookupLinks(seed)
  autoRenderLinks(links)
  autoSetStatus('Texte public lu localement. Vérification API publique en cours...')
  const registry = await autoSearchRegistry(seed)
  autoApplyExtraction({ extraction, registry, sourceLabel: 'Import public collé + liens publics' })

  const diagnostic = autoBuildDiagnostic({
    seed,
    links: registry.publicLookupLinks,
    registry,
    extraction,
    mode: 'pasted-public-result-import'
  })
  autoWriteOutput(diagnostic)
  autoSaveLookup({ at: new Date().toISOString(), ...diagnostic })
  autoSetStatus('Import terminé. Champs préremplis et lecture SSF-IRS régénérée.')
  if (typeof logAction === 'function') logAction('auto-fetch:pasted-public-text-imported', { query: seed.query, queryType: seed.queryType })
}

async function runAutoFetch() {
  let seed
  try {
    seed = autoBuildLookupSeed()
  } catch (error) {
    autoSetStatus('Récupération impossible : entrée absente.')
    autoWriteOutput({ reason: error.message || 'Erreur inconnue.' })
    return
  }

  const links = autoPublicLookupLinks(seed)
  autoRenderLinks(links)
  autoWriteOutput({
    mode: 'public-lookup-started',
    policy: 'NO_ACCOUNT_NO_TOKEN_PUBLIC_IDENTITY_ONLY',
    query: seed.query,
    queryType: seed.queryType,
    publicLookupLinks: links,
    instruction: 'Ouvrir les liens publics si nécessaire. Coller ensuite le résultat visible dans la zone d’import.'
  })
  autoSaveLookup({ at: new Date().toISOString(), seed, links })
  autoSetStatus('Liens publics construits. Requête API ouverte en cours...')

  const registry = await autoSearchRegistry(seed)
  const registryEntity = autoMapRegistryEntity(registry.selected)
  const extraction = {
    pageUrl: seed.pageUrl || 'Recherche publique sans page auditée lue',
    sourcePages: [{ label: 'Recherche publique', pageUrl: seed.pageUrl || seed.query, fetchedBytes: 0 }],
    hasLegalNotice: false,
    hasPrivacyPolicy: false,
    hasCookiesInfo: false,
    hasRightsContact: false,
    entityName: registryEntity.name || (seed.queryType === 'entity_name' ? seed.query : ''),
    legalForm: registryEntity.legalForm || '',
    siren: registryEntity.siren || (seed.queryType === 'SIREN' ? seed.query : ''),
    siret: registryEntity.siret || (seed.queryType === 'SIRET' ? seed.query : ''),
    address: registryEntity.address || '',
    activity: registryEntity.naf || '',
    naf: registryEntity.naf || '',
    entityLocation: 'Source publique : Annuaire / API / Pappers',
    sirenLocation: registryEntity.siren || seed.queryType === 'SIREN' ? 'Source publique' : '',
    siretLocation: registryEntity.siret || seed.queryType === 'SIRET' ? 'Source publique' : '',
    addressLocation: registryEntity.address ? 'Source publique' : '',
    rightsLocation: '',
    links,
    extractedSamples: []
  }

  autoApplyExtraction({ extraction, registry, sourceLabel: 'Recherche publique sans compte ni jeton' })

  const targetInput = document.querySelector('#target-url')
  const targetUrl = autoMaybeUrl(targetInput ? targetInput.value : '')
  let siteRequest = null
  if (targetUrl && !targetUrl.hostname.includes('annuaire-entreprises.data.gouv.fr') && !targetUrl.hostname.includes('pappers.fr')) {
    try {
      const fetched = await autoFetchHtml(autoNormalizeTargetUrl(targetUrl.href))
      const siteExtraction = await autoBuildExtraction(targetUrl, fetched.html, fetched.request)
      Object.assign(extraction, siteExtraction)
      siteRequest = fetched.request
    } catch (error) {
      siteRequest = error.request || {
        method: 'GET',
        url: targetUrl.href,
        mode: 'cors',
        credentials: 'omit',
        ok: false,
        status: 'UNKNOWN',
        error: error.message || 'Lecture impossible'
      }
    }
  }

  const diagnostic = autoBuildDiagnostic({
    seed,
    links: registry.publicLookupLinks,
    registry,
    extraction,
    siteRequest,
    mode: 'public-lookup-api-first'
  })
  autoWriteOutput(diagnostic)
  autoSaveLookup({ at: new Date().toISOString(), ...diagnostic })
  autoSetStatus(registry.selected
    ? 'Préremplissage terminé depuis l’API publique. Les liens Pappers / Annuaire restent disponibles pour contrôle.'
    : 'Aucun résultat API certain. Les liens publics sont disponibles pour récupération manuelle et import par collage.')
  if (typeof logAction === 'function') {
    logAction('auto-fetch:public-lookup-completed', {
      query: seed.query,
      queryType: seed.queryType,
      registryStatus: registry.selected ? 'SAT' : 'UNKNOWN',
      policy: 'NO_ACCOUNT_NO_TOKEN_PUBLIC_IDENTITY_ONLY'
    })
  }
}

if (autoFetchButton) autoFetchButton.addEventListener('click', runAutoFetch)
if (buildPublicLinksButton) buildPublicLinksButton.addEventListener('click', buildPublicLinksOnly)
if (importPublicTextButton) importPublicTextButton.addEventListener('click', importPublicText)

if (clearAutoFetchButton) {
  clearAutoFetchButton.addEventListener('click', () => {
    autoSetStatus('Résultat automatique effacé. Les champs restent modifiables manuellement.')
    autoWriteOutput('Aucune récupération affichée.')
    autoRenderLinks([])
    if (typeof logAction === 'function') logAction('auto-fetch:output-cleared')
  })
}