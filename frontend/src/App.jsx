// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import ProfilePage from './components/ProfilePage';
import StatisticsPage from './components/StatisticsPage';
import SettingsPage from './components/SettingsPage';
import AboutUsPage from './components/AboutUsPage'; // << NOVO IMPORT

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex bg-slate-900 min-h-screen">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        profileImageUrl={profileImageUrl}
      />
      <div className="flex-1 flex flex-col relative overflow-x-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <Outlet context={{
            profileImageUrl, setProfileImageUrl,
            sidebarCollapsed
          }} />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/about-us" element={<AboutUsPage />} /> {/* << NOVA ROTA ADICIONADA */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Main />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;