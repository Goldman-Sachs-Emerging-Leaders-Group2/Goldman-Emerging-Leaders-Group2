export const buildCopilotContext = ({ results, form, funds, activeView, monthlyContribution }) => ({
  results: Object.values(results),
  availableFunds: funds,
  selectedTickers: form.tickers,
  investment: Number(form.investment) || null,
  years: Number(form.years) || null,
  monthlyContribution: Number(monthlyContribution) || null,
  currentView: activeView,
})

const VIEW_CHIPS = {
  home: [
    'What is CAPM?',
    'How does this tool work?',
    'What should I know before investing?',
  ],
  plan: [
    'Help me pick funds',
    'What does beta mean?',
    'Compare these funds for me',
  ],
  results: [
    'Summarize my results',
    'Which fund is riskiest?',
    'Suggest rebalancing',
  ],
  saved: [
    'Compare my saved scenarios',
    'What trends do you see?',
    'Am I improving?',
  ],
  learn: [
    'Explain CAPM simply',
    'What is compounding?',
    'How does risk tolerance work?',
  ],
}

export const getChipsForView = (view) => VIEW_CHIPS[view] || VIEW_CHIPS.home
