import PublicLayout from '../components/PublicLayout';

export default function CancellationPage() {
  return (
    <PublicLayout>
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6 p-4 md:p-8 text-gray-700">
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
    </PublicLayout>
  );
}