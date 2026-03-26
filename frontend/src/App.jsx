import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import TopHeader from './components/TopHeader'
import DashboardView from './views/DashboardView'
import CalculatorView from './views/CalculatorView'
import AnalyticsView from './views/AnalyticsView'
import PortfolioView from './views/PortfolioView'
import SettingsView from './views/SettingsView'

function App() {
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
              <Route path="/analytics" element={<AnalyticsView />} />
              <Route path="/portfolio" element={<PortfolioView />} />
              <Route path="/settings" element={<SettingsView />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
