import PublicLayout from '../components/PublicLayout';

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6 p-4 md:p-8 text-gray-700">
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
    </PublicLayout>
  );
}