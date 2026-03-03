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
import AttendancePage from './pages/AttendancePage'; // <-- NEW IMPORT

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
      case 'attendance': return <AttendancePage />; // <-- NEW CASE
      default: return <DashboardPage />;
    }
  };

  return <Layout>{renderPage()}</Layout>;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;