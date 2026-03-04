import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import BatchesPage from './pages/BatchesPage';
import LiveClassesPage from './pages/LiveClassesPage';
import AppointmentsPage from './pages/AppointmentsPage';
import BillingPage from './pages/BillingPage';
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage'; 
import SettingsPage from './pages/SettingsPage';
import AttendancePage from './pages/AttendancePage'; 
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import CancellationPage from './pages/CancellationPage';

function AppContent() {
  const { activeTab } = useApp();

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage />;
      case 'users': return <UsersPage />;
      case 'batches': return <BatchesPage />;
      case 'live-classes': return <LiveClassesPage />;
      case 'appointments': return <AppointmentsPage />;
      case 'billing': return <BillingPage />;
      case 'notifications': return <NotificationsPage />;
      case 'messages': return <MessagesPage />; 
      case 'services': return <SettingsPage />;
      case 'attendance': return <AttendancePage />; 
      case 'profile': return <ProfilePage />;
      default: return <DashboardPage />;
    }
  };

  return <Layout>{renderPage()}</Layout>;
}

function AppRoot() {
  const { isAuthenticated, currentView } = useApp();
  const path = window.location.pathname;

  // Intercept explicit login view
  if (currentView === 'login') return <LoginPage />;

  // URL-based routing for public pages
  if (path === '/privacy-policy') return <PrivacyPage />;
  if (path === '/cancellation-policy') return <CancellationPage />;
  if (path === '/about-us' || path === '/') return <AboutPage />;

  // If trying to access admin panel without auth, show About Us as default fallback
  if (!isAuthenticated) {
    return <AboutPage />;
  }

  return <AppContent />;
}

function App() {
  return (
    <AppProvider>
      <AppRoot />
    </AppProvider>
  );
}

export default App;