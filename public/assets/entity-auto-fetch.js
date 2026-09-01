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

function autoDomainHint(url) {
  return url.hostname
    .replace(/^www\./i, '')
    .split('.')
    .slice(0, -1)
    .join(' ')
    .replace(/[-_]+/g, ' ')
    .trim()
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
    /(?:exploité par|exploite par|édité par|edite par)\s+([^\n.;]{3,120})/i,
    /(?:société|societe)\s+([A-Z0-9][A-Z0-9 '&.,\-]{2,120})/
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

function autoPublicLookupLinks({ pageUrl, query }) {
  const fallbackQuery = autoDomainHint(pageUrl)
  const searchQuery = autoSafeText(query || fallbackQuery, 180)
  const apiUrl = new URL(SEARCH_API_BASE)
  apiUrl.searchParams.set('q', searchQuery)
  apiUrl.searchParams.set('per_page', '5')

  const annuaireUrl = new URL('https://annuaire-entreprises.data.gouv.fr/rechercher')
  annuaireUrl.searchParams.set('terme', searchQuery)

  const pappersUrl = new URL('https://www.pappers.fr/recherche')
  pappersUrl.searchParams.set('q', searchQuery)

  return [
    {
      key: 'recherche-entreprises-api',
      label: 'Ouvrir la requête API Recherche d’Entreprises',
      type: 'open_api_no_account_no_token',
      url: apiUrl.href
    },
    {
      key: 'annuaire-entreprises-web',
      label: 'Ouvrir Annuaire Entreprises',
      type: 'public_web_no_account_no_token',
      url: annuaireUrl.href
    },
    {
      key: 'pappers-public-web',
      label: 'Ouvrir Pappers public',
      type: 'public_web_no_account_no_token',
      url: pappersUrl.href
    }
  ]
}

async function autoSearchRegistry({ siren, siret, entityName, pageUrl }) {
  const query = siret || siren || entityName || autoDomainHint(pageUrl)
  const queryType = siret ? 'SIRET' : siren ? 'SIREN' : entityName ? 'entity_name' : 'domain_hint'
  const links = autoPublicLookupLinks({ pageUrl, query })
  const apiLink = links.find(link => link.key === 'recherche-entreprises-api')

  if (!query) {
    return {
      query: '',
      queryType: 'none',
      requestUrl: '',
      publicLookupLinks: links,
      results: [],
      selected: null,
      error: 'Aucun identifiant, nom ou indice de domaine exploitable.'
    }
  }

  try {
    const response = await fetch(apiLink.url, { method: 'GET', credentials: 'omit', mode: 'cors' })
    if (!response.ok) throw new Error(`Réponse API ${response.status}`)
    const payload = await response.json()
    const results = Array.isArray(payload.results) ? payload.results : []
    return {
      query,
      queryType,
      requestUrl: apiLink.url,
      publicLookupLinks: links,
      results,
      selected: results[0] || null,
      error: ''
    }
  } catch (error) {
    return {
      query,
      queryType,
      requestUrl: apiLink.url,
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

function autoBuildPageExtraction(pageUrl, html, label) {
  const parser = new DOMParser()
  const documentNode = parser.parseFromString(html, 'text/html')
  const text = autoTextFromDocument(documentNode)
  const links = autoDetectLinks(pageUrl, documentNode)
  const identifiers = autoExtractIdentifiers(text)

  return {
    label,
    pageUrl: pageUrl.href,
    fetchedBytes: html.length,
    hasLegalNotice: /mentions légales|mentions legales|éditeur|editeur|hébergeur|hebergeur/i.test(text),
    hasPrivacyPolicy: /politique de confidentialité|politique de confidentialite|privacy policy|données personnelles|donnees personnelles/i.test(text),
    hasCookiesInfo: /cookies?|traceurs?/i.test(text),
    hasRightsContact: /droit d'accès|droit d’acces|rectification|effacement|opposition|dpo|protection des données/i.test(text),
    entityName: autoExtractEntityName(text, documentNode),
    legalForm: autoExtractLegalForm(text),
    siren: identifiers.siren,
    siret: identifiers.siret,
    address: autoExtractAddress(text),
    links,
    textSample: autoSafeText(text, 700)
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

function autoMergeExtractions(pageUrl, pages) {
  const allLinks = pages.flatMap(page => page.links || [])
  const uniqueLinks = []
  allLinks.forEach(link => {
    if (!uniqueLinks.some(item => item.href === link.href)) uniqueLinks.push(link)
  })

  const legalLink = uniqueLinks.find(link => link.type === 'legal-notice')
  const privacyLink = uniqueLinks.find(link => link.type === 'privacy-policy')
  const cookiesLink = uniqueLinks.find(link => link.type === 'cookies-info')
  const contactLink = uniqueLinks.find(link => link.type === 'contact')

  return {
    pageUrl: pageUrl.href,
    sourcePages: pages.map(page => ({ label: page.label, pageUrl: page.pageUrl, fetchedBytes: page.fetchedBytes })),
    hasLegalNotice: Boolean(legalLink || pages.some(page => page.hasLegalNotice)),
    hasPrivacyPolicy: Boolean(privacyLink || pages.some(page => page.hasPrivacyPolicy)),
    hasCookiesInfo: Boolean(cookiesLink || pages.some(page => page.hasCookiesInfo)),
    hasRightsContact: Boolean(contactLink || pages.some(page => page.hasRightsContact)),
    entityName: autoPickFirst(pages, 'entityName'),
    legalForm: autoPickFirst(pages, 'legalForm'),
    siren: autoPickFirst(pages, 'siren'),
    siret: autoPickFirst(pages, 'siret'),
    address: autoPickFirst(pages, 'address'),
    entityLocation: autoPickLocation(pages, 'entityName', legalLink ? autoHumanLocation('Mentions légales', legalLink.href) : 'Page lue automatiquement'),
    sirenLocation: autoPickLocation(pages, 'siren', legalLink ? autoHumanLocation('Mentions légales', legalLink.href) : 'Page lue automatiquement'),
    siretLocation: autoPickLocation(pages, 'siret', legalLink ? autoHumanLocation('Mentions légales', legalLink.href) : 'Page lue automatiquement'),
    addressLocation: autoPickLocation(pages, 'address', legalLink ? autoHumanLocation('Mentions légales', legalLink.href) : 'Page lue automatiquement'),
    rightsLocation: autoExtractRightsLocation(uniqueLinks),
    links: uniqueLinks.slice(0, 20),
    extractedSamples: pages.map(page => ({ label: page.label, pageUrl: page.pageUrl, sample: page.textSample }))
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

function autoBuildFailureReport({ pageUrl, error }) {
  const query = pageUrl ? autoDomainHint(pageUrl) : ''
  const links = pageUrl ? autoPublicLookupLinks({ pageUrl, query }) : []
  autoRenderLinks(links)
  return {
    mode: 'user-triggered-auto-fetch-v0.3-diagnostic',
    policy: 'NO_ACCOUNT_NO_TOKEN_PUBLIC_IDENTITY_ONLY',
    site: pageUrl ? pageUrl.href : null,
    siteFetch: 'UNKNOWN',
    attemptedSiteRequest: error && error.request ? error.request : pageUrl ? {
      method: 'GET',
      url: pageUrl.href,
      mode: 'cors',
      credentials: 'omit'
    } : null,
    publicLookupLinks: links,
    reason: error && error.message ? error.message : 'Erreur inconnue.',
    userExplanation: 'La requête et les liens sont affichés pour récupération manuelle. Le navigateur peut empêcher la lecture d’un site externe si le site ne l’autorise pas par ses en-têtes CORS. Aucune donnée avec compte, jeton ou clé API n’est utilisée.'
  }
}

async function runAutoFetch() {
  const input = document.querySelector('#target-url')
  if (autoFetchOutput) autoFetchOutput.hidden = false
  autoSetStatus('Récupération lancée par l’utilisateur...')
  autoWriteOutput('Construction de la requête publique sans compte ni jeton...')

  let pageUrl = null

  try {
    pageUrl = autoNormalizeUrl(input ? input.value : '')
    if (input) input.value = pageUrl.href
    autoRenderLinks(autoPublicLookupLinks({ pageUrl, query: autoDomainHint(pageUrl) }))

    const firstFetch = await autoFetchHtml(pageUrl)
    const extraction = await autoBuildExtraction(pageUrl, firstFetch.html, firstFetch.request)
    autoSetStatus('Site lu quand autorisé. Requête registre publique en cours...')

    const registry = await autoSearchRegistry({ ...extraction, pageUrl })
    autoRenderLinks(registry.publicLookupLinks)
    autoApplyExtraction({ extraction, registry })

    const report = {
      mode: 'user-triggered-auto-fetch-v0.3-diagnostic',
      policy: 'NO_ACCOUNT_NO_TOKEN_PUBLIC_IDENTITY_ONLY',
      site: pageUrl.href,
      siteFetch: 'SAT',
      registryFetch: registry.selected ? 'SAT' : 'UNKNOWN',
      dataScope: [
        'dénomination',
        'forme juridique',
        'SIREN',
        'SIRET',
        'adresse',
        'activité / NAF',
        'état administratif simple',
        'source',
        'emplacement trouvé'
      ],
      excludedData: [
        'bénéfices',
        'chiffre d’affaires',
        'comptes annuels',
        'bilans',
        'documents dirigeants détaillés',
        'bénéficiaires effectifs'
      ],
      requests: {
        siteRequests: extraction.pageRequests,
        registryRequest: {
          method: 'GET',
          url: registry.requestUrl,
          query: registry.query,
          queryType: registry.queryType,
          credentials: 'omit',
          accountRequired: false,
          tokenRequired: false
        },
        publicLookupLinks: registry.publicLookupLinks
      },
      extraction,
      registry: {
        query: registry.query,
        queryType: registry.queryType,
        requestUrl: registry.requestUrl,
        error: registry.error,
        resultCount: registry.results.length,
        selected: autoMapRegistryEntity(registry.selected)
      }
    }

    autoWriteOutput(report)
    autoSetStatus('Préremplissage terminé. Requêtes et liens publics affichés dans le diagnostic.')
    if (typeof logAction === 'function') {
      logAction('auto-fetch:completed', {
        site: pageUrl.href,
        registryStatus: report.registryFetch,
        registryRequest: registry.requestUrl,
        policy: report.policy
      })
    }
  } catch (error) {
    const report = autoBuildFailureReport({ pageUrl, error })
    autoSetStatus('Récupération automatique impossible. Requête récupérable et mode manuel conservé.')
    autoWriteOutput(report)
    if (typeof logAction === 'function') {
      logAction('auto-fetch:blocked-or-failed', {
        reason: report.reason,
        attemptedSiteRequest: report.attemptedSiteRequest,
        publicLookupLinks: report.publicLookupLinks,
        policy: report.policy
      })
    }
  }
}

if (autoFetchButton) {
  autoFetchButton.addEventListener('click', runAutoFetch)
}

if (clearAutoFetchButton) {
  clearAutoFetchButton.addEventListener('click', () => {
    autoSetStatus('Résultat automatique effacé. Les champs restent modifiables manuellement.')
    autoWriteOutput('Aucune récupération affichée.')
    autoRenderLinks([])
    if (typeof logAction === 'function') logAction('auto-fetch:output-cleared')
  })
}