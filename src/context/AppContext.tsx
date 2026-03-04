import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAuthenticated: boolean;
  login: (rememberMe: boolean, adminData: any) => void;
  logout: () => void;
  currentView: 'landing' | 'login' | 'admin';
  setCurrentView: (view: 'landing' | 'login' | 'admin') => void;
  adminUser: any;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'admin'>('landing');
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    // Check storage on load for Remember Me / Session data
    const storedAuth = localStorage.getItem('isAdminAuth') || sessionStorage.getItem('isAdminAuth');
    const storedAdmin = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
    
    if (storedAuth === 'true' && storedAdmin) {
      setIsAuthenticated(true);
      setCurrentView('admin');
      setAdminUser(JSON.parse(storedAdmin));
    }
  }, []);

  const login = (rememberMe: boolean, adminData: any) => {
    setIsAuthenticated(true);
    setCurrentView('admin');
    setAdminUser(adminData);
    
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('isAdminAuth', 'true');
    storage.setItem('adminUser', JSON.stringify(adminData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentView('landing');
    setAdminUser(null);
    localStorage.removeItem('isAdminAuth');
    localStorage.removeItem('adminUser');
    sessionStorage.removeItem('isAdminAuth');
    sessionStorage.removeItem('adminUser');
  };

  return (
    <AppContext.Provider 
      value={{ 
        activeTab, 
        setActiveTab, 
        isAuthenticated, 
        login, 
        logout, 
        currentView, 
        setCurrentView, 
        adminUser 
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}