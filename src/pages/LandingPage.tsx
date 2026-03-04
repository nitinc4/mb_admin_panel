import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function LandingPage() {
  const { setCurrentView } = useApp();
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div className="min-h-screen bg-[#FFFBF7] flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-white shadow-sm p-5 flex justify-between items-center px-8 border-b border-orange-100">
        <div className="flex items-center gap-3 text-orange-700">
          <h1 className="text-3xl font-bold tracking-widest font-serif uppercase">
            Mantrika Brahma
          </h1>
        </div>
        <button
          onClick={() => setCurrentView('login')}
          className="bg-orange-600 text-white px-6 py-2.5 rounded hover:bg-orange-700 transition-colors font-medium shadow-sm"
        >
          Admin Login
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 mt-8 mb-12 bg-white shadow-xl shadow-orange-900/5 rounded-sm border border-orange-50">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-10 border-b border-gray-200">
          <button
            className={`px-8 py-4 font-serif text-lg tracking-wide transition-colors border-b-2 ${
              activeTab === 'about' 
                ? 'border-orange-600 text-orange-700 font-semibold' 
                : 'border-transparent text-gray-500 hover:text-orange-500'
            }`}
            onClick={() => setActiveTab('about')}
          >
            About Us
          </button>
          <button
            className={`px-8 py-4 font-serif text-lg tracking-wide transition-colors border-b-2 ${
              activeTab === 'privacy' 
                ? 'border-orange-600 text-orange-700 font-semibold' 
                : 'border-transparent text-gray-500 hover:text-orange-500'
            }`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy Policy
          </button>
          <button
            className={`px-8 py-4 font-serif text-lg tracking-wide transition-colors border-b-2 ${
              activeTab === 'cancellation' 
                ? 'border-orange-600 text-orange-700 font-semibold' 
                : 'border-transparent text-gray-500 hover:text-orange-500'
            }`}
            onClick={() => setActiveTab('cancellation')}
          >
            Cancellation Policy
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 md:p-8 text-gray-700 leading-relaxed min-h-[400px]">
          
          {/* ABOUT US TAB */}
          {activeTab === 'about' && (
            <div className="animate-fade-in space-y-8">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-serif font-bold text-orange-800 mb-4">Shree Balamuri Ganapathi Kalikadevi Jyothishyalaya</h2>
                <div className="w-24 h-1 bg-orange-400 mx-auto rounded-full"></div>
              </div>

              <div className="space-y-4 text-lg">
                <p>
                  <strong>Mantrika Brahma</strong> is a part of Shree Balamuri Ganapathi Kalikadevi Jyothishyalaya which is a traditional spiritual center dedicated to the study and practice of ancient Mantra, Tantra, and Yantra sciences rooted in the sacred traditions of India, particularly the Kerala Tantric lineage.
                </p>
                <p>
                  Located in Jayanagar, Bengaluru, the Jyothishyalaya is guided by the spiritual teachings and practices of Sri Sri Sri Subhash Acharya Guruji, a respected Kerala Tantric scholar, Balamuri Ganapathi Mantric practitioner, and devotee of Bhadrakali Devi. The institution focuses on spiritual guidance, ritual practices, and traditional remedies designed to help individuals overcome life’s obstacles and restore harmony in personal, professional, and spiritual aspects of life.
                </p>
                <p>
                  Our practices are based on classical Tantric systems that combine Mantra (sacred sound), Yantra (sacred geometry), and ritualistic spiritual practices. These traditions have been preserved through generations of guru-disciple lineages and temple-based spiritual systems. At our Jyothishyalaya, spiritual seekers receive guidance through structured rituals, mantra sadhana, and traditional spiritual practices aimed at energy balancing, protection, and spiritual growth.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
                  <h3 className="text-xl font-serif font-semibold text-orange-800 mb-3">Our Spiritual Services</h3>
                  <p className="mb-3 text-sm">We provide guidance and spiritual rituals for individuals seeking solutions to various life challenges, including:</p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>Removal of negative spiritual influences and Vamachara effects</li>
                    <li>Remedies for job and career-related obstacles</li>
                    <li>Resolution of marital and relationship disputes</li>
                    <li>Spiritual remedies for marriage delays</li>
                    <li>Guidance for childbirth-related concerns</li>
                    <li>Solutions for land, property, and legal disputes</li>
                    <li>Domestic harmony and family peace rituals</li>
                    <li>Financial and business growth guidance</li>
                    <li>Protection rituals against negative energies and evil eye</li>
                  </ul>
                  <p className="mt-3 text-sm italic">These services are performed through traditional Tantric and Mantric rituals, including homa, mantra japa, kavacha practices, and energy protection rituals.</p>
                </div>

                <div className="space-y-8">
                  <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
                    <h3 className="text-xl font-serif font-semibold text-orange-800 mb-3">Kerala Tantric Tradition</h3>
                    <p className="mb-3 text-sm">Our spiritual practices are deeply influenced by the powerful Kerala Tantric Sampradaya, known for its disciplined temple rituals and Devi worship traditions. This includes:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-3">
                      <li>Bhadrakali Tantra</li>
                      <li>Ganapathi Tantra</li>
                      <li>Shakta Upasana</li>
                      <li>Temple-based Agama rituals</li>
                      <li>Mantra Siddhi practices</li>
                    </ul>
                    <p className="text-sm italic">These systems incorporate sacred rituals such as Guruthi Pooja, Chandi Homa, Sri Chakra Pooja, and Ganapathi Homa.</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-4">
                <div>
                  <h3 className="text-xl font-serif font-semibold text-orange-800 mb-3">Training and Spiritual Education</h3>
                  <p className="mb-3">To preserve these ancient traditions, the Jyothishyalaya also conducts yearly training programs in Tantra, Mantra, and Yantra practices. These classes include:</p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-3">
                    <li>Foundations of Aghora Tantra and Shakti worship</li>
                    <li>Practical applications of Mantra, Tantra, and Yantra</li>
                    <li>Traditional tantric pooja methods</li>
                    <li>Guru lineage-based spiritual guidance</li>
                    <li>Practical spiritual knowledge applicable in daily life</li>
                  </ul>
                  <p className="text-sm italic">Classes are available both offline and online, allowing seekers from different locations to participate.</p>
                </div>

                <div>
                  <h3 className="text-xl font-serif font-semibold text-orange-800 mb-3">Who Can Join</h3>
                  <p className="mb-3">The classes are open to:</p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
                    <li>Temple priests (Archakas) and Purohits</li>
                    <li>Astrologers and spiritual practitioners</li>
                    <li>Beginners interested in Tantra and mantra sadhana</li>
                    <li>Experienced practitioners seeking deeper knowledge</li>
                    <li>Spiritual seekers above the age of 18</li>
                  </ul>
                  <p className="font-medium text-orange-900">People from all religions, castes, and communities who are sincerely interested in spiritual learning are welcome.</p>
                </div>
              </div>

              <div className="text-center mt-8 p-6 bg-orange-100/50 rounded-lg">
                <p className="text-lg font-serif text-orange-900 italic">
                  "At Shree Balamuri Ganapathi Kalikadevi Jyothishyalaya, our mission is to preserve sacred knowledge, guide spiritual seekers, and provide traditional remedies rooted in ancient wisdom for peace, protection, and spiritual progress."
                </p>
              </div>
            </div>
          )}

          {/* PRIVACY POLICY TAB */}
          {activeTab === 'privacy' && (
            <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
              <h2 className="text-3xl font-serif font-bold text-orange-800 mb-6 text-center">Privacy Policy</h2>
              
              <p className="text-lg">
                At Shree Balamuri Ganapathi Kalikadevi Jyothishyalaya, we are committed to protecting the privacy and personal information of our visitors, students, and clients. This Privacy Policy outlines how we collect, use, and safeguard your information when you interact with our website or services.
              </p>

              <div className="space-y-4 mt-6">
                <h3 className="text-xl font-serif font-semibold text-orange-800">Information We Collect</h3>
                <p>We may collect the following types of information when you use our website or enroll in our services:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Full name</li>
                  <li>Contact number</li>
                  <li>Email address</li>
                  <li>Address details</li>
                  <li>Identification documents (such as Aadhaar copy when required for course registration)</li>
                  <li>Photographs submitted during registration</li>
                  <li>Information voluntarily shared for spiritual consultations or rituals</li>
                </ul>

                <h3 className="text-xl font-serif font-semibold text-orange-800 mt-6">How We Use Your Information</h3>
                <p>Your information may be used for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Processing registrations for spiritual classes and training programs</li>
                  <li>Scheduling consultations or spiritual services</li>
                  <li>Communicating updates regarding services, rituals, or classes</li>
                  <li>Maintaining internal records and documentation</li>
                  <li>Improving our services and website experience</li>
                </ul>
                <p className="italic mt-2">We do not sell, rent, or share personal information with third parties for marketing purposes.</p>

                <h3 className="text-xl font-serif font-semibold text-orange-800 mt-6">Data Protection</h3>
                <p>We take reasonable measures to ensure that your personal information is protected from unauthorized access, misuse, or disclosure. Sensitive documents submitted for registration are used solely for verification and administrative purposes.</p>

                <h3 className="text-xl font-serif font-semibold text-orange-800 mt-6">Third-Party Links</h3>
                <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of those external websites.</p>

                <h3 className="text-xl font-serif font-semibold text-orange-800 mt-6">Consent</h3>
                <p>By using our website and services, you consent to the terms outlined in this Privacy Policy.</p>

                <h3 className="text-xl font-serif font-semibold text-orange-800 mt-6">Updates to This Policy</h3>
                <p>We may update this Privacy Policy periodically. Any updates will be reflected on this page.</p>
              </div>
            </div>
          )}

          {/* CANCELLATION POLICY TAB */}
          {activeTab === 'cancellation' && (
            <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
              <h2 className="text-3xl font-serif font-bold text-orange-800 mb-6 text-center">Cancellation & Refund Policy</h2>
              
              <p className="text-lg mb-6">
                At Shree Balamuri Ganapathi Kalikadevi Jyothishyalaya, we strive to provide transparent and fair policies for all participants and clients.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-serif font-semibold text-orange-800 mb-2">Spiritual Services</h3>
                  <p>
                    Fees paid for spiritual rituals, consultations, or remedial practices are generally non-refundable, as preparations, materials, and scheduling are arranged in advance according to traditional practices.
                  </p>
                  <p className="mt-2">
                    However, in exceptional cases where a service cannot be conducted due to unavoidable circumstances from our side, the appointment may be rescheduled or adjusted accordingly.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif font-semibold text-orange-800 mb-2">Training Classes</h3>
                  <p className="mb-2">For students enrolling in Tantra, Mantra, and Yantra training programs, the following policies apply:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Cancellation requests must be submitted before the start of the class or course.</li>
                    <li>Once the course or training session has begun, fees will not be refundable.</li>
                    <li>The Trust Committee reserves the right to approve or deny refund requests based on the circumstances.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-serif font-semibold text-orange-800 mb-2">Online Classes</h3>
                  <p>
                    Participants attending online classes must ensure they have proper internet connectivity and technical arrangements. Fees for online sessions are non-refundable once access to the class has been provided.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif font-semibold text-orange-800 mb-2">Changes or Rescheduling</h3>
                  <p className="mb-2">In case of unavoidable circumstances, the Jyothishyalaya reserves the right to:</p>
                  <ul className="list-disc pl-6 space-y-1 mb-2">
                    <li>Reschedule classes or rituals</li>
                    <li>Modify schedules</li>
                    <li>Conduct sessions online if required</li>
                  </ul>
                  <p>Participants will be informed in advance wherever possible.</p>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg border border-orange-100 mt-8">
                  <h3 className="text-xl font-serif font-semibold text-orange-800 mb-2">Contact for Cancellation Requests</h3>
                  <p>
                    For cancellation or rescheduling requests, participants should contact the Jyothishyalaya directly through the contact details provided on the website.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="py-8 text-center text-gray-400 text-sm font-serif">
        &copy; {new Date().getFullYear()} Shree Balamuri Ganapathi Kalikadevi Jyothishyalaya. All rights reserved.
      </footer>
    </div>
  );
}