import FooterPageLayout from '@/components/layout/FooterPageLayout';
import { FaKey, FaHandSparkles, FaTools, FaBell } from 'react-icons/fa';

export default function HostResponsibilitiesContent() {
  return (
    <FooterPageLayout
      title="Host Responsibilities"
      description="Maintaining the best standards. Understand your duties as a verified landlord."
      lastUpdated="April 2026"
    >
      <div className="mb-12 relative rounded-3xl overflow-hidden group shadow-md border border-gray-100 dark:border-gray-800">
        <img src="https://picsum.photos/seed/hostingRes/1200/400" alt="Beautiful Room" className="w-full h-[300px] object-cover transition-transform duration-[2000ms] group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/40 flex flex-col justify-center p-8 md:p-12">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 max-w-xl">Quality creates loyalty and guarantees renewals.</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        
        <div className="flex gap-6 group">
          <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-4 rounded-2xl h-min group-hover:bg-green-500 transition-colors duration-300">
            <FaHandSparkles className="text-2xl text-green-600 dark:text-green-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-2xl font-bold dark:text-white mb-2">Maintain High Cleanliness</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Every room must be thoroughly cleaned and sanitized before a new student arrives. Providing basic cleaning equipment in shared spaces encourages tenants to maintain the standard.
            </p>
          </div>
        </div>

        <div className="flex gap-6 group">
          <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 p-4 rounded-2xl h-min group-hover:bg-blue-500 transition-colors duration-300">
            <FaTools className="text-2xl text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-2xl font-bold dark:text-white mb-2">Timely Maintenance</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Ensure broken appliances, plumbing issues, or electrical hazards are fixed within 48 hours. Long delays can result in penalties or negative reviews.
            </p>
          </div>
        </div>

        <div className="flex gap-6 group">
          <div className="mt-1 bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-2xl h-min group-hover:bg-yellow-500 transition-colors duration-300">
            <FaBell className="text-2xl text-yellow-600 dark:text-yellow-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-2xl font-bold dark:text-white mb-2">Respect Privacy (24Hr Notice)</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Unless there is an absolute emergency, landlords must give at least 24 hours' notice before inspecting or entering a tenant’s dorm room.
            </p>
          </div>
        </div>

        <div className="flex gap-6 group">
          <div className="mt-1 bg-purple-100 dark:bg-purple-900/30 p-4 rounded-2xl h-min group-hover:bg-purple-500 transition-colors duration-300">
            <FaKey className="text-2xl text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-2xl font-bold dark:text-white mb-2">Secure Surroundings</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Main gates should lock securely. Hallways should be well-lit. We highly recommend CCTV systems positioned facing main entrances.
            </p>
          </div>
        </div>

      </div>
    </FooterPageLayout>
  );
}
