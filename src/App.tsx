import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import BatchesPage from './pages/BatchesPage';
import LiveClassesPage from './pages/LiveClassesPage';
import AppointmentsPage from './pages/AppointmentsPage';
import BillingPage from './pages/BillingPage'; // <-- Added this import
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const { activeTab } = useApp();

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'users':
        return <UsersPage />;
      case 'batches':
        return <BatchesPage />;
      case 'live-classes':
        return <LiveClassesPage />;
      case 'appointments':
        return <AppointmentsPage />;
      case 'billing':
        return <BillingPage />; // <-- Replaced PlaceholderPage
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <Layout>{renderPage()}</Layout>;
}

// Keeping PlaceholderPage just in case you need it for future empty modules
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-600 mt-1">This module will be implemented in later stages</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <p className="text-gray-600">Coming soon...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;