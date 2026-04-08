import { useState } from 'react'

const VALID_VIEWS = new Set(['home', 'plan', 'results', 'portfolio', 'analytics', 'saved', 'learn'])

export function useViewState() {
  const [activeView, setActiveView] = useState('home')

  const navigateTo = (view) => {
    if (VALID_VIEWS.has(view)) {
      setActiveView(view)
    }
  }

  const startPlan = () => setActiveView('plan')
  const showResults = () => setActiveView('results')
  const showSaved = () => setActiveView('saved')
  const showLearn = () => setActiveView('learn')
  const goHome = () => setActiveView('home')

  return {
    activeView,
    dashboardMode: activeView !== 'home',
    navigateTo,
    startPlan,
    showResults,
    showSaved,
    showLearn,
    goHome,
  }
}
