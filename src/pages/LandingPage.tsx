import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Moon, Sun } from 'lucide-react';

export default function LandingPage() {
  const { setCurrentView } = useApp();
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center px-8">
        <div className="flex items-center gap-2 text-indigo-900">
          <Moon className="w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-wide">MantrikaBrahma</h1>
        </div>
        <button
          onClick={() => setCurrentView('login')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
        >
          Admin Login
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-8 mt-12 bg-white shadow-lg rounded-2xl border border-gray-100 mb-12">
        <div className="flex justify-center mb-8 border-b">
          <button
            className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${activeTab === 'about' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-500'}`}
            onClick={() => setActiveTab('about')}
          >
            About Us
          </button>
          <button
            className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${activeTab === 'privacy' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-500'}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy Policy
          </button>
          <button
            className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${activeTab === 'cancellation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-500'}`}
            onClick={() => setActiveTab('cancellation')}
          >
            Cancellation Policy
          </button>
        </div>

        <div className="p-6 text-gray-700 leading-relaxed min-h-[300px]">
          {activeTab === 'about' && (
            <div className="animate-fade-in flex flex-col items-center text-center">
              <Sun className="w-16 h-16 text-amber-500 mb-6" />
              <h2 className="text-3xl font-semibold mb-4 text-indigo-900">Guiding Your Celestial Journey</h2>
              <p className="max-w-2xl text-lg">
                Welcome to MantrikaBrahma. We bring ancient astrological wisdom to the modern world.
                Our expert astrologers provide personalized birth chart readings, compatibility analysis,
                and planetary guidance to help you navigate life's cosmic journey. Discover your true
                potential aligned with the stars.
              </p>
            </div>
          )}
          {activeTab === 'privacy' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-semibold mb-4 text-indigo-900">Privacy Policy</h2>
              <p className="mb-4">
                Your celestial secrets are sacred and strictly confidential. At MantrikaBrahma, we prioritize the protection of your personal and astrological data.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We do not share your birth details, location, or consultation records with any third parties.</li>
                <li>All user data is securely encrypted in our database vault.</li>
                <li>You retain full rights to request the deletion of your account and cosmic history at any time.</li>
              </ul>
            </div>
          )}
          {activeTab === 'cancellation' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-semibold mb-4 text-indigo-900">Cancellation & Refund Policy</h2>
              <p className="mb-4">
                We understand that the stars might occasionally misalign with your schedule.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Appointments can be canceled or rescheduled up to 24 hours in advance without any penalty.</li>
                <li>Cancellations made within 24 hours of the scheduled consultation may be subject to a nominal fee.</li>
                <li>No-shows will be charged the full consultation amount.</li>
                <li>Refunds for eligible cancellations will be processed within 5-7 business days.</li>
              </ul>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} MantrikaBrahma Astrology Services. All rights reserved.
      </footer>
    </div>
  );
}