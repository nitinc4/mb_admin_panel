import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import BatchesPage from './pages/BatchesPage';
import LiveClassesPage from './pages/LiveClassesPage';
import AppointmentsPage from './pages/AppointmentsPage';
import BillingPage from './pages/BillingPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import AttendancePage from './pages/AttendancePage'; 
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import CancellationPage from './pages/CancellationPage';
import TermsPage from './pages/TermsPage';

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

  // 1. Explicitly check for specific public sub-pages first
  if (path === '/privacy-policy') return <PrivacyPage />;
  if (path === '/cancellation-policy') return <CancellationPage />;
  if (path === '/terms-and-conditions') return <TermsPage />;
  if (path === '/about-us') return <AboutPage />;

  // 2. Intercept explicit login view if the user is not authenticated yet
  if (!isAuthenticated && currentView === 'login') {
    return <LoginPage />;
  }

  // 3. If authenticated, always show the dashboard when on the root path '/'
  if (isAuthenticated) {
    return <AppContent />;
  }

  // 4. Default unauthenticated fallback
  return <AboutPage />;
}

function App() {
  return (
    <AppProvider>
      <AppRoot />
    </AppProvider>
  );
}

export default App;