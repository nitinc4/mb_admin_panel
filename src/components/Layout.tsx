import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20 shadow-sm">
        <div className="flex items-center">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 -ml-2 text-gray-600 hover:text-primary transition-colors"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-800 ml-2">MantrikaBrahma</h1>
        </div>
      </div>

      {/* Sidebar gets the toggle state */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content - Added pt-16 for mobile to offset the top bar */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 w-full">
        {children}
      </main>
    </div>
  );
}