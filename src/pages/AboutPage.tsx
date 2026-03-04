import PublicLayout from '../components/PublicLayout';

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="animate-fade-in space-y-8 p-4 md:p-8 text-gray-700 leading-relaxed">
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
    </PublicLayout>
  );
}