import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import TopHeader from './components/TopHeader'
import CopilotFAB from './components/CopilotFAB'
import CopilotPanel from './components/CopilotPanel'
import DashboardView from './views/DashboardView'
import CalculatorView from './views/CalculatorView'
import AnalyticsView from './views/AnalyticsView'
import PortfolioView from './views/PortfolioView'
import HistoryView from './views/HistoryView'
import SettingsView from './views/SettingsView'

function App() {
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [copilotInitialMessage, setCopilotInitialMessage] = useState(null)

  const openCopilotWithMessage = useCallback((message) => {
    setCopilotInitialMessage(message)
    setCopilotOpen(true)
  }, [])

  const handleCloseCopilot = useCallback(() => {
    setCopilotOpen(false)
    setCopilotInitialMessage(null)
  }, [])

  return (
    <AppProvider>
      <BrowserRouter>
        <div className="dashboard-shell">
          <Sidebar />
          <div className="main-wrapper">
            <TopHeader />
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/calculator" element={<CalculatorView />} />
              <Route path="/analytics" element={<AnalyticsView onExplainMetric={openCopilotWithMessage} />} />
              <Route path="/portfolio" element={<PortfolioView />} />
              <Route path="/history" element={<HistoryView />} />
              <Route path="/settings" element={<SettingsView />} />
            </Routes>
          </div>
          <CopilotFAB onClick={() => setCopilotOpen((v) => !v)} isOpen={copilotOpen} />
          <CopilotPanel
            isOpen={copilotOpen}
            onClose={handleCloseCopilot}
            initialMessage={copilotInitialMessage}
          />
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
