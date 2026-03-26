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

import { useTheme } from './hooks/useTheme'
import { useViewState } from './hooks/useViewState'
import { useFundForm } from './hooks/useFundForm'
import { useCalculation } from './hooks/useCalculation'
import { useInvestmentHistory } from './hooks/useInvestmentHistory'

// Staggered reveal timing for results section children
const reveal = (delay) => ({ animation: `revealUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both` })

// Reusable style constants
const card = 'rounded-xl p-5 transition-all duration-150 hover:border-[var(--accent)] hover:bg-[rgba(181,152,90,0.03)]'
const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }
const cardHeader = 'flex items-center justify-between mb-4'
const cardTitle = 'text-base font-semibold m-0'
const badgeBase = 'text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full border'

function App() {
  const { theme, toggleTheme } = useTheme()
  const { dashboardMode, activeView, enterDashboard, navigateTo, exitDashboard } = useViewState()
  const form = useFundForm()
  const calc = useCalculation()
  const history = useInvestmentHistory((msg) => calc.setCalculationError(msg))

  const handleSubmit = async (event) => {
    event.preventDefault()
    const errors = form.validateForm()
    if (Object.keys(errors).length > 0) return

    const success = await calc.calculate(
      form.form, form.monthlyContribution, form.customTickers,
      (failedSet) => form.cleanupFailedTickers(failedSet)
    )

    if (success) {
      form.setFormCollapsed(true)
      enterDashboard('results')
    }
  }

  const handleNewAnalysis = () => {
    exitDashboard()
    form.setFormCollapsed(false)
    calc.reset()
    window.scrollTo(0, 0)
  }

  const handleRerun = (inv) => {
    form.populateFrom(inv)
    navigateTo('results')
    window.scrollTo(0, 0)
  }

  const handleSave = () => history.saveResults(calc.results)

  const isStale = calc.isStale(form.form)
  const narrative = calc.getNarrative(form.goalAmount, form.riskTolerance)

  // Alerts
  const alerts = (
    <>
      {form.loadError && (
        <div className="max-w-[1200px] mx-auto mb-4 px-8 py-3 rounded-xl text-sm font-medium bg-red-600/[0.08] border border-red-600/20" style={{ color: 'var(--error)' }}>
          {form.loadError}
        </div>
      )}
      {calc.calculationError && (
        <div className="max-w-[1200px] mx-auto mb-4 px-8 py-3 rounded-xl text-sm font-medium bg-red-600/[0.08] border border-red-600/20" style={{ color: 'var(--error)' }}>
          {calc.calculationError}
        </div>
      )}
      {form.isLoadingFunds && (
        <div className="max-w-[1200px] mx-auto mb-4 px-8 py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
          Loading mutual fund data…
        </div>
      )}
    </>
  )

  // Calculator form card
  const calculatorCard = (
    <section className={card} style={cardStyle}>
      {/* Summary bar — visible when collapsed */}
      <div className={`overflow-hidden transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${form.formCollapsed ? 'max-h-20 opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        {calc.hasResults && (
          <div data-form-summary>
            <FormSummary
              tickers={calc.resultTickers}
              investment={form.form.investment}
              years={form.form.years}
              onExpand={() => form.setFormCollapsed(false)}
            />
          </div>
        )}
      </div>

      {/* Full form — visible when expanded */}
      <div className={`overflow-hidden transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${form.formCollapsed ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[800px] opacity-100'}`}>
        <div className={cardHeader}>
          <h2 className={cardTitle} style={{ color: 'var(--text-primary)' }}>Investment Parameters</h2>
          <span className={`${badgeBase} ${calc.isCalculating
            ? 'bg-[#00244D]/[0.08] border-[#B5985A]/30'
            : 'bg-emerald-600/10 border-emerald-600/20'
          }`} style={{ color: calc.isCalculating ? 'var(--accent)' : 'var(--success)' }}>
            {calc.isCalculating ? 'Calculating…' : 'Ready'}
          </span>
        </div>
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
    </section>
  )

  // Results view — staggered reveal animation on each section
  const resultsView = calc.hasResults && (
    <section className="mt-6 flex flex-col gap-8">
      {narrative && (
        <p className="text-[0.95rem] leading-relaxed" style={{ color: 'var(--text-secondary)', ...reveal(0.25) }}>
          {narrative}
        </p>
      )}

      <div style={reveal(0.45)}>
        <SummaryStats
          bestResult={calc.bestResult}
          bestCapmResult={calc.bestCapmResult}
          resultCount={calc.resultCount}
        />
      </div>

      <div style={reveal(0.6)}>
        <SaveBar
          label={history.saveLabel}
          onLabelChange={history.setSaveLabel}
          onSave={handleSave}
          saveStatus={history.saveStatus}
          resultCount={calc.resultCount}
          error={history.saveError}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" style={reveal(0.75)}>
        <div className={card} style={cardStyle}>
          <div className={cardHeader}>
            <h2 className={cardTitle} style={{ color: 'var(--text-primary)' }}>Projected Results</h2>
            <div className="flex items-center gap-1.5">
              {isStale && (
                <span className={`${badgeBase} bg-amber-600/10 border-amber-600/20`} style={{ color: 'var(--warning)' }}>Stale</span>
              )}
              {calc.isCalculating && (
                <span className={`${badgeBase} bg-[#00244D]/[0.08] border-[#B5985A]/30`} style={{ color: 'var(--accent)' }}>Updating…</span>
              )}
            </div>
          </div>
          <ResultPanel results={calc.results} isCalculating={calc.isCalculating} isStale={isStale} riskTolerance={form.riskTolerance} />
        </div>
        <div className={card} style={cardStyle}>
          <div className={cardHeader}>
            <h2 className={cardTitle} style={{ color: 'var(--text-primary)' }}>Investment Breakdown</h2>
          </div>
          <PieBreakdown result={calc.bestResult} isMulti={calc.isMulti} />
        </div>
      </div>

      <div className={card} style={{ ...cardStyle, ...reveal(0.95) }}>
        <div className={cardHeader}>
          <h2 className={cardTitle} style={{ color: 'var(--text-primary)' }}>Projected Growth</h2>
          {isStale && (
            <span className={`${badgeBase} bg-amber-600/10 border-amber-600/20`} style={{ color: 'var(--warning)' }}>Stale</span>
          )}
        </div>
        <GrowthChart results={calc.results} isCalculating={calc.isCalculating} goalAmount={form.goalAmount} />
      </div>

      <div className={card} style={{ ...cardStyle, ...reveal(1.15) }}>
        <div className={cardHeader}>
          <h2 className={cardTitle} style={{ color: 'var(--text-primary)' }}>Investment Insights</h2>
          {isStale && (
            <span className={`${badgeBase} bg-amber-600/10 border-amber-600/20`} style={{ color: 'var(--warning)' }}>Stale</span>
          )}
        </div>
        <InsightsPanel results={calc.results} isCalculating={calc.isCalculating} riskTolerance={form.riskTolerance} />
      </div>
    </section>
  )

  // History view
  const historyView = (
    <section className="animate-fade-in-up">
      <div className={card} style={cardStyle}>
        <div className={cardHeader}>
          <h2 className={cardTitle} style={{ color: 'var(--text-primary)' }}>Saved Investments</h2>
          {history.savedInvestments.length > 0 && (
            <span className={`${badgeBase} bg-emerald-600/10 border-emerald-600/20`} style={{ color: 'var(--success)' }}>
              {history.savedInvestments.length} saved
            </span>
          )}
        </div>
        <InvestmentHistory
          investments={history.savedInvestments}
          onDelete={history.removeInvestment}
          onRerun={handleRerun}
          isLoading={history.isLoadingHistory}
        />
      </div>
    </section>
  )

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <PageHeader
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogoClick={dashboardMode ? handleNewAnalysis : undefined}
      />

      <ErrorBoundary>
      {!dashboardMode ? (
        <>
          {/* Entry Mode */}
          <section className="text-center pt-10 pb-5 px-8 animate-fade-in-up">
            <h1 className="text-3xl max-md:text-2xl max-[480px]:text-xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
              Mutual Fund Investment Calculator
            </h1>
            <p className="text-base max-w-[600px] mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Select funds, enter your investment, and see projected returns using the Capital Asset Pricing Model.
            </p>
          </section>

          {alerts}

          <main className="max-w-[1200px] mx-auto px-8 max-md:px-4 pb-12 w-full flex-1">
            {calculatorCard}
            {history.savedInvestments.length > 0 && (
              <button
                className="block mx-auto mt-6 px-6 py-3 bg-transparent border border-[var(--card-border)] rounded-xl text-sm cursor-pointer transition-all hover:-translate-y-px hover:border-[var(--accent)] hover:bg-[rgba(181,152,90,0.06)]"
                style={{ color: 'var(--accent)' }}
                onClick={() => enterDashboard('history')}
              >
                View saved investments ({history.savedInvestments.length}) →
              </button>
            )}
          </main>

          <footer className="py-6 px-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            <div className="h-px mx-auto max-w-[1200px] mb-4" style={{ background: 'var(--card-border)' }} />
            <p className="m-0">Goldman Sachs Emerging Leaders Program — Group 2</p>
            <p className="text-xs mt-1 opacity-70 m-0">
              Market data from Newton Analytics and Yahoo Finance. CAPM projections are estimates, not financial advice.
            </p>
          </footer>
        </>
      ) : (
        <>
          {/* Dashboard Mode */}
          <Sidebar
            activeView={activeView}
            onNavigate={navigateTo}
            savedCount={history.savedInvestments.length}
            onNewAnalysis={handleNewAnalysis}
          />
          <main className="ml-[210px] min-w-0 max-w-[1400px] px-16 py-8 animate-[contentFadeIn_0.7s_cubic-bezier(0.16,1,0.3,1)_0.2s_both]">
            {alerts}
            {activeView === 'results' && calculatorCard}
            {activeView === 'results' && resultsView}
            {activeView === 'history' && historyView}
          </main>
        </>
      )}
      </ErrorBoundary>
    </div>
  )
}

export default App
