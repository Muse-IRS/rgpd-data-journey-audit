(() => {
  'use strict'

  const root = document.querySelector('[data-flow-demo]')
  if (!root) return

  const observedEmail = root.querySelector('[data-observed="email"]')
  const statusEmail = root.querySelector('[data-status="email"]')
  const globalState = root.querySelector('[data-global]')
  const divergence = root.querySelector('[data-divergence]')
  const live = root.querySelector('[data-live]')
  const correct = root.querySelector('[data-action="correct"]')
  const restore = root.querySelector('[data-action="restore"]')
  const row = root.querySelector('[data-row="email"]')

  function render(isDivergent) {
    observedEmail.textContent = isDivergent ? 'Oui' : 'Non'
    statusEmail.textContent = isDivergent ? 'À VÉRIFIER' : 'CONVERGENT'
    globalState.textContent = isDivergent ? 'À VÉRIFIER' : 'CONVERGENT'
    divergence.textContent = isDivergent ? 'Email' : 'Aucune'
    row.classList.toggle('is-divergent', isDivergent)
    row.classList.toggle('is-convergent', !isDivergent)
    live.innerHTML = isDivergent
      ? '<strong>Résultat :</strong> l’email est déclaré non transmis mais observé dans le contexte IA. Aucune cause n’est déduite.'
      : '<strong>Résultat :</strong> la correction locale a restauré la cohérence déclarative du flux sans modifier le système métier ni le service IA.'
  }

  correct.addEventListener('click', () => render(false))
  restore.addEventListener('click', () => render(true))
  render(true)
})()
