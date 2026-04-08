import { useEffect } from 'react'

import CalculatorForm from './components/CalculatorForm'
import GrowthChart from './components/GrowthChart'
import InsightsPanel from './components/InsightsPanel'
import ResultPanel from './components/ResultPanel'
import PieBreakdown from './components/PieBreakdown'
import Sidebar from './components/Sidebar'
import InvestmentHistory from './components/InvestmentHistory'
import PageHeader from './components/PageHeader'
import SummaryStats from './components/SummaryStats'
import SaveBar from './components/SaveBar'
import FormSummary from './components/FormSummary'
import ErrorBoundary from './components/ErrorBoundary'
import LearnPanel from './components/LearnPanel'

import { formatCurrency, formatPercent } from './utils/formatters'
import { useTheme } from './hooks/useTheme'
import { useViewState } from './hooks/useViewState'
import { useFundForm } from './hooks/useFundForm'
import { useCalculation } from './hooks/useCalculation'
import { useInvestmentHistory } from './hooks/useInvestmentHistory'

const TRUST_STRIP = [
  'Same assumptions across every fund',
  'CAPM methodology explained in plain language',
  'Saved scenarios you can reopen later',
]

const HOW_IT_WORKS = [
  {
    title: 'Choose a short list',
    description: 'Pick the mutual funds you are truly weighing, then add a benchmark only if it helps you stay oriented.',
  },
  {
    title: 'Set your real plan',
    description: 'Enter the starting amount, any monthly contribution, and the time horizon you can actually stick to.',
  },
  {
    title: 'Read the tradeoffs',
    description: 'Northline shows projected value, CAPM return, beta, and practical guidance without turning the comparison into a wall of jargon.',
  },
]

const VALUE_GRID = [
  {
    title: 'Modern',
    description: 'Editorial typography, soft surfaces, and a lighter visual system make the product feel current without sliding into fintech hype.',
  },
  {
    title: 'Trustworthy',
    description: 'Methodology notes, measured color use, and quiet data presentation signal that the product is designed to inform, not to oversell.',
  },
  {
    title: 'User-friendly',
    description: 'Every major workflow is grouped into clear steps, with plain-language labels and persistent scenario context.',
  },
]

const METHODOLOGY_POINTS = [
  'CAPM estimates the expected return for each fund using a risk-free baseline, beta, and the market return.',
  'Monthly contributions and time horizon stay identical across the comparison so only the fund characteristics change.',
  'Northline frames the output as a projection, not financial advice, so you can use the numbers as decision support rather than certainty.',
]

const estimatePreviewValue = ({ investment, monthlyContribution, years, annualReturn }) => {
  let total = Number(investment) || 0
  const recurring = Number(monthlyContribution) || 0
  const horizon = Number(years) || 0
  const rate = Number(annualReturn) || 0

  for (let year = 0; year < horizon; year += 1) {
    total = (total + recurring * 12) * (1 + rate)
  }

  return total
}

function App() {
  const { theme, toggleTheme } = useTheme()
  const { activeView, navigateTo, startPlan, showResults, goHome } = useViewState()
  const form = useFundForm()
  const calc = useCalculation()
  const history = useInvestmentHistory((msg) => calc.setCalculationError(msg))

  const handleSubmit = async (event) => {
    event.preventDefault()
    const errors = form.validateForm()
    if (Object.keys(errors).length > 0) return

    const success = await calc.calculate(
      form.form,
      form.monthlyContribution,
      form.customTickers,
      (failedSet) => form.cleanupFailedTickers(failedSet),
    )

    if (success) {
      showResults()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNavigate = (view) => {
    if (view === 'results' && !calc.hasResults) return
    navigateTo(view)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNewPlan = () => {
    form.resetPlanner()
    calc.reset()
    startPlan()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEditScenario = () => {
    startPlan()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRerun = (investment) => {
    form.populateFrom(investment)
    calc.loadSavedResult(investment)
    showResults()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = () => history.saveResults(calc.results)

  const isStale = calc.isStale(form.form, form.monthlyContribution)
  const narrative = calc.getNarrative(form.goalAmount, form.riskTolerance)
  const previewFund = form.funds.find((fund) => fund.ticker === form.form.tickers[0]) || form.funds[0]
  const previewRate = calc.bestResult?.capmReturn ?? previewFund?.expectedAnnualReturn ?? 0.08
  const previewValue = calc.bestResult?.futureValue ?? estimatePreviewValue({
    investment: form.form.investment,
    monthlyContribution: form.monthlyContribution,
    years: form.form.years,
    annualReturn: previewRate,
  })
  const previewLabel = calc.hasResults ? 'Latest run' : 'Sample path'

  useEffect(() => {
    if (activeView !== 'home' || typeof window === 'undefined') {
      return undefined
    }

    const selector = '[data-scrollreveal]'

    const applyReveal = () => {
      const createScrollReveal = window.ScrollReveal
      if (typeof createScrollReveal !== 'function') return

      const sr = createScrollReveal()
      sr.clean(selector)
      sr.reveal(selector, {
        distance: '0px',
        duration: 560,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: 0,
        scale: 1,
        reset: true,
        viewFactor: 0.8,
        interval: 110,
      })
    }

    applyReveal()

    const script = document.getElementById('scrollreveal-cdn')
    if (!window.ScrollReveal && script) {
      script.addEventListener('load', applyReveal, { once: true })
      return () => script.removeEventListener('load', applyReveal)
    }

    return undefined
  }, [activeView])

  const alerts = (
    <div className="grid gap-3">
      {form.loadError && (
        <div className="rounded-[20px] border border-[color:var(--error)]/20 bg-[color:var(--error)]/8 px-4 py-3 text-sm text-[color:var(--error)]">
          {form.loadError}
        </div>
      )}
      {calc.calculationError && (
        <div className="rounded-[20px] border border-[color:var(--warning)]/20 bg-[color:var(--warning)]/10 px-4 py-3 text-sm text-[color:var(--warning)]">
          {calc.calculationError}
        </div>
      )}
      {form.isLoadingFunds && (
        <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--text-secondary)]">
          Loading fund list…
        </div>
      )}
    </div>
  )

  const homeView = (
    <section className="grid gap-10 py-10">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="grid gap-6">
          <div>
            <p className="northline-eyebrow mb-3">Northline Compass</p>
            <h1 className="northline-page-title">
              Compare fund paths with a calmer, clearer planning workflow.
            </h1>
            <p className="mt-5 max-w-[62ch] text-base leading-8 text-[color:var(--text-secondary)]">
              Northline helps first-time investors compare mutual funds side by side with the same assumptions, plain-language explanations, and a more trustworthy planning experience.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" className="northline-button-primary" onClick={() => handleNavigate('plan')}>
              Build a plan
            </button>
            <button type="button" className="northline-button-secondary" onClick={() => handleNavigate('learn')}>
              Learn the basics
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {TRUST_STRIP.map((item) => (
              <div key={item} className="northline-card rounded-[22px] px-4 py-4 text-sm leading-6 text-[color:var(--text-secondary)]">
                <span className="mb-3 block h-2.5 w-2.5 rounded-full bg-[color:var(--signal)]" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="northline-card-strong rounded-[32px] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="northline-eyebrow-inverse mb-2">{previewLabel}</p>
              <h2 className="text-[1.8rem] font-semibold tracking-[-0.03em] text-[color:var(--hero-text)]">
                {formatCurrency(previewValue)}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[color:var(--hero-muted)]">
                Based on your current starting inputs and {calc.hasResults ? 'your last comparison' : 'the lead fund now selected'}.
              </p>
            </div>
            <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--hero-text)]">
              {previewFund?.ticker || 'Preview'}
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--hero-muted)]">Starting amount</p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--hero-text)]">{formatCurrency(Number(form.form.investment || 0))}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--hero-muted)]">Monthly contribution</p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--hero-text)]">{formatCurrency(Number(form.monthlyContribution || 0))}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--hero-muted)]">Time horizon</p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--hero-text)]">{form.form.years} years</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--hero-muted)]">Reference return</p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--hero-text)]">{formatPercent(previewRate)}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {HOW_IT_WORKS.map((step, index) => (
          <div key={step.title} data-scrollreveal className="northline-card rounded-[28px] p-6">
            <p className="northline-eyebrow mb-3">Step {index + 1}</p>
            <h2 className="text-[1.4rem] font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">
              {step.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
              {step.description}
            </p>
          </div>
        ))}
      </section>

      <div className="grid gap-10">
        <section data-scrollreveal className="northline-card-strong rounded-[32px] p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
            <div>
              <p className="northline-eyebrow-inverse mb-3">Methodology</p>
              <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-[color:var(--hero-text)]">
                Transparent enough to trust, simple enough to use.
              </h2>
            </div>
            <div className="grid gap-3">
              {METHODOLOGY_POINTS.map((point) => (
                <div key={point} className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4 text-sm leading-7 text-[color:var(--hero-muted)]">
                  {point}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {VALUE_GRID.map((item) => (
            <div key={item.title} data-scrollreveal className="northline-card rounded-[28px] p-6">
              <p className="northline-eyebrow mb-3">{item.title}</p>
              <p className="text-sm leading-7 text-[color:var(--text-secondary)]">{item.description}</p>
            </div>
          ))}
        </section>

        <section data-scrollreveal className="northline-card rounded-[32px] p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="northline-eyebrow mb-3">Learning support</p>
              <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-[color:var(--text-primary)]">
                Want context before you commit to a comparison?
              </h2>
              <p className="mt-4 max-w-[56ch] text-base leading-8 text-[color:var(--text-secondary)]">
                The Planning Basics section explains CAPM, compounding, and risk in plain language so you can interpret the comparison with more confidence.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <button type="button" className="northline-button-primary" onClick={() => handleNavigate('learn')}>
                Explore planning basics
              </button>
              <button type="button" className="northline-button-secondary" onClick={() => handleNavigate('plan')}>
                Go to planner
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  )

  const planView = (
    <section className="grid gap-8 py-10">
      <div className="max-w-[64ch]">
        <p className="northline-eyebrow mb-3">Planner</p>
        <h1 className="northline-page-title">Build the comparison you want to trust.</h1>
        <p className="mt-4 text-base leading-8 text-[color:var(--text-secondary)]">
          Group the funds you want to evaluate, set the money plan you can genuinely follow, and let Northline show the tradeoffs clearly.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_340px] lg:items-start">
        <div>
          <CalculatorForm
            funds={form.funds}
            form={form.form}
            errors={form.fieldErrors}
            onChange={form.handleChange}
            onToggleTicker={form.handleToggleTicker}
            onSubmit={handleSubmit}
            isCalculating={calc.isCalculating}
            isLoadingFunds={form.isLoadingFunds}
            goalAmount={form.goalAmount}
            onGoalChange={form.handleGoalChange}
            monthlyContribution={form.monthlyContribution}
            onMonthlyChange={form.handleMonthlyChange}
            riskTolerance={form.riskTolerance}
            onRiskToleranceChange={form.handleRiskToleranceChange}
            customTickers={form.customTickers}
            onAddCustomTicker={form.handleAddCustomTicker}
            onRemoveCustomTicker={form.handleRemoveCustomTicker}
          />
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-[154px]">
          <div className="northline-card rounded-[28px] p-5 sm:p-6">
            <FormSummary
              tickers={form.form.tickers}
              investment={form.form.investment}
              monthlyContribution={form.monthlyContribution}
              years={form.form.years}
              goalAmount={form.goalAmount}
              riskTolerance={form.riskTolerance}
            />
          </div>

          <div className="northline-card rounded-[28px] p-5 sm:p-6">
            <p className="northline-eyebrow mb-2">Why this feels safer</p>
            <p className="text-sm leading-7 text-[color:var(--text-secondary)]">
              The planner keeps the workflow in three steps, holds the scenario summary beside you, and uses the same assumptions across each fund so you can focus on differences that matter.
            </p>
          </div>

          {history.savedInvestments.length > 0 && (
            <div className="northline-card rounded-[28px] p-5 sm:p-6">
              <p className="northline-eyebrow mb-2">Saved scenarios</p>
              <p className="text-sm leading-7 text-[color:var(--text-secondary)]">
                You already have {history.savedInvestments.length} saved {history.savedInvestments.length === 1 ? 'scenario' : 'scenarios'} to revisit.
              </p>
              <button type="button" className="northline-button-secondary mt-4" onClick={() => handleNavigate('saved')}>
                Review saved
              </button>
            </div>
          )}
        </aside>
      </div>
    </section>
  )

  const resultsView = calc.hasResults ? (
    <section className="grid gap-8 py-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[62ch]">
          <p className="northline-eyebrow mb-3">Results</p>
          <h1 className="northline-page-title">Read the tradeoffs, not just the biggest number.</h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--text-secondary)]">
            Northline surfaces the projected leader, the CAPM signal, and the risk profile together so the strongest-looking fund is not judged in isolation.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="northline-button-secondary" onClick={handleEditScenario}>
            Edit scenario
          </button>
          <button type="button" className="northline-button-secondary" onClick={handleNewPlan}>
            Start new plan
          </button>
        </div>
      </div>

      <SummaryStats
        bestResult={calc.bestResult}
        bestCapmResult={calc.bestCapmResult}
        resultCount={calc.resultCount}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="northline-card rounded-[28px] p-5 sm:p-6">
          <FormSummary
            tickers={calc.resultTickers}
            investment={form.form.investment}
            monthlyContribution={form.monthlyContribution}
            years={form.form.years}
            goalAmount={form.goalAmount}
            riskTolerance={form.riskTolerance}
            onExpand={handleEditScenario}
          />
        </div>

        <div className="northline-card rounded-[28px] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="northline-eyebrow mb-2">Northline readout</p>
              <h2 className="text-[1.65rem] font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">
                Recommendation narrative
              </h2>
            </div>
            {isStale && <span className="northline-chip">Inputs changed since last run</span>}
          </div>
          <p className="mt-4 text-sm leading-7 text-[color:var(--text-secondary)]">
            {narrative}
          </p>
        </div>
      </div>

      <SaveBar
        label={history.saveLabel}
        onLabelChange={history.setSaveLabel}
        onSave={handleSave}
        saveStatus={history.saveStatus}
        resultCount={calc.resultCount}
        error={history.saveError}
      />

      <div className="grid gap-6">
        <div className="northline-card rounded-[28px] p-5 sm:p-6">
          <p className="northline-eyebrow mb-2">Growth path</p>
          <h2 className="text-[1.6rem] font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">
            Projected growth over time
          </h2>
          <div className="mt-5">
            <GrowthChart results={calc.results} isCalculating={calc.isCalculating} goalAmount={form.goalAmount} />
          </div>
        </div>

        <div className="northline-card rounded-[28px] p-5 sm:p-6">
          <p className="northline-eyebrow mb-2">Comparison detail</p>
          <h2 className="text-[1.6rem] font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">
            Detailed metrics
          </h2>
          <div className="mt-5">
            <ResultPanel results={calc.results} isCalculating={calc.isCalculating} riskTolerance={form.riskTolerance} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="northline-card rounded-[28px] p-5 sm:p-6">
          <p className="northline-eyebrow mb-2">Guidance</p>
          <h2 className="text-[1.6rem] font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">
            Planning insights
          </h2>
          <div className="mt-5">
            <InsightsPanel results={calc.results} isCalculating={calc.isCalculating} riskTolerance={form.riskTolerance} />
          </div>
        </div>

        <div className="northline-card rounded-[28px] p-5 sm:p-6">
          <p className="northline-eyebrow mb-2">Breakdown</p>
          <h2 className="text-[1.6rem] font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">
            What is driving the total
          </h2>
          <div className="mt-5">
            <PieBreakdown result={calc.bestResult} isMulti={calc.isMulti} />
          </div>
        </div>
      </div>
    </section>
  ) : (
    <section className="py-10">
      <div className="northline-empty-state">
        Results unlock after you build a comparison.
        <div className="mt-4">
          <button type="button" className="northline-button-primary" onClick={() => handleNavigate('plan')}>
            Go to planner
          </button>
        </div>
      </div>
    </section>
  )

  const savedView = (
    <section className="grid gap-8 py-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[62ch]">
          <p className="northline-eyebrow mb-3">Saved scenarios</p>
          <h1 className="northline-page-title">Reopen prior thinking without starting from scratch.</h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--text-secondary)]">
            Saved scenarios preserve the projection details so you can bring a plan back into Results and continue from there.
          </p>
        </div>
        <button type="button" className="northline-button-secondary" onClick={handleNewPlan}>
          New plan
        </button>
      </div>

      <InvestmentHistory
        investments={history.savedInvestments}
        onDelete={history.removeInvestment}
        onRerun={handleRerun}
        isLoading={history.isLoadingHistory}
      />
    </section>
  )

  return (
    <div className="min-h-screen text-[color:var(--text-primary)]">
      <PageHeader theme={theme} onToggleTheme={toggleTheme} onLogoClick={goHome} />
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        savedCount={history.savedInvestments.length}
        onNewAnalysis={handleNewPlan}
        hasResults={calc.hasResults}
      />

      <ErrorBoundary>
        <main className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          {alerts}
          {activeView === 'home' && homeView}
          {activeView === 'plan' && planView}
          {activeView === 'results' && resultsView}
          {activeView === 'saved' && savedView}
          {activeView === 'learn' && <LearnPanel onStartPlan={() => handleNavigate('plan')} />}
        </main>
      </ErrorBoundary>

      <footer className="border-t border-[color:var(--line)] bg-[color:var(--surface-elevated)]/92">
        <div className="mx-auto max-w-[1280px] px-4 py-6 text-sm leading-7 text-[color:var(--text-secondary)] sm:px-6 lg:px-8">
          Northline is for educational and comparison purposes only. It does not provide financial advice, investment advice, or a recommendation to buy, sell, or hold any security.
        </div>
      </footer>
    </div>
  )
}

export default App
