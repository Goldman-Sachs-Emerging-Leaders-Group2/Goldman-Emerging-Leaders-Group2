export const buildCopilotContext = ({ results, form, assets, currentPage }) => ({
  results: Object.values(results),
  availableAssets: assets,
  selectedTickers: form.tickers,
  investment: Number(form.investment) || null,
  years: Number(form.years) || null,
  currentPage,
})

const PAGE_CHIPS = {
  '/': [
    'What is CAPM?',
    'Explain my results',
    'What should I do next?',
  ],
  '/calculator': [
    'Help me pick assets',
    'What does beta mean?',
    'Compare these funds',
  ],
  '/portfolio': [
    'Summarize my portfolio',
    'Which asset is riskiest?',
    'Suggest rebalancing',
  ],
  '/analytics': [
    'Explain this chart',
    'What does my beta tell me?',
    'Is this return good?',
  ],
  '/history': [
    'Compare my last two calculations',
    'Am I improving?',
    'What trends do you see?',
  ],
  '/settings': [
    'What is CAPM?',
    'How is beta calculated?',
    'What does risk-free rate mean?',
  ],
}

export const getChipsForPage = (pathname) => PAGE_CHIPS[pathname] || PAGE_CHIPS['/']
