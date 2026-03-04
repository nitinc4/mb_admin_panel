import { ReactNode } from 'react';
import { useApp } from '../context/AppContext';

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { setCurrentView } = useApp();

  return (
    <div className="min-h-screen bg-[#FFFBF7] flex flex-col font-sans">
      <header className="bg-white shadow-sm p-5 flex flex-col md:flex-row justify-between items-center px-8 border-b border-orange-100 gap-4">
        <div className="flex items-center gap-3 text-orange-700">
          <a href="/" className="text-3xl font-bold tracking-widest font-serif uppercase hover:text-orange-800 transition-colors">
            Mantrika Brahma
          </a>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 text-orange-900 font-serif">
            <a href="/about-us" className="hover:text-orange-600 transition-colors">About Us</a>
            <a href="/privacy-policy" className="hover:text-orange-600 transition-colors">Privacy Policy</a>
            <a href="/cancellation-policy" className="hover:text-orange-600 transition-colors">Cancellation</a>
          </nav>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/');
              setCurrentView('login');
            }}
            className="bg-orange-600 text-white px-6 py-2.5 rounded hover:bg-orange-700 transition-colors font-medium shadow-sm"
          >
            Admin Login
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 mt-8 mb-12 bg-white shadow-xl shadow-orange-900/5 rounded-sm border border-orange-50">
        {children}
      </main>

      <footer className="py-8 text-center text-gray-400 text-sm font-serif">
        &copy; {new Date().getFullYear()} Shree Balamuri Ganapathi Kalikadevi Jyothishyalaya. All rights reserved.
      </footer>
    </div>
  );
}