import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import AddTradePage from './pages/AddTradePage';
import TradeHistoryPage from './pages/TradeHistoryPage';
import DailyJournalPage from './pages/DailyJournalPage';
import WatchlistPage from './pages/WatchlistPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotesPage from './pages/NotesPage';
import SettingsPage from './pages/SettingsPage';
import { SettingsProvider } from './context/SettingsContext';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <SettingsProvider>
      <Router>
        <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
          {/* Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />

          {/* Main Content Area */}
          <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}>
            {/* Top Navbar */}
            <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

            {/* Main Page View */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/add-trade" element={<AddTradePage />} />
                <Route path="/edit-trade/:id" element={<AddTradePage />} />
                <Route path="/trades" element={<TradeHistoryPage />} />
                <Route path="/daily-journal" element={<DailyJournalPage />} />
                <Route path="/watchlist" element={<WatchlistPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </SettingsProvider>
  );
}

export default App;
