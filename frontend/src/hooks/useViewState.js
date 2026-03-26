import { useState } from 'react'

export function useViewState() {
  const [dashboardMode, setDashboardMode] = useState(false)
  const [activeView, setActiveView] = useState('results')

  const enterDashboard = (view = 'results') => {
    setDashboardMode(true)
    setActiveView(view)
  }

  const navigateTo = (view) => setActiveView(view)

  const exitDashboard = () => {
    setDashboardMode(false)
    setActiveView('results')
  }

  return { dashboardMode, activeView, enterDashboard, navigateTo, exitDashboard }
}
