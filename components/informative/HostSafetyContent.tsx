import FooterPageLayout from '@/components/layout/FooterPageLayout';
import { FaUserCheck, FaGavel, FaFireExtinguisher } from 'react-icons/fa';

export default function HostSafetyContent() {
  return (
    <FooterPageLayout
      title="Safety for Hosts"
      description="Keep yourself and your property protected with our comprehensive host safety guidelines."
      lastUpdated="April 2026"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-4xl font-bold mb-6 dark:text-white leading-tight">Your property, your rules. Safe and secure.</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Opening your doors requires trust. BoardTAU reinforces that trust with built-in protections, profile verifications, and structural guidelines to prevent liabilities.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md mt-1 border border-gray-100 dark:border-gray-700">
                <FaUserCheck className="text-green-500 text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-lg dark:text-gray-200">Vet Student Profiles</h4>
                <p className="text-gray-500 dark:text-gray-400">Review user verification levels—ensure their submitted ID matches their platform photo.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md mt-1 border border-gray-100 dark:border-gray-700">
                <FaGavel className="text-blue-500 text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-lg dark:text-gray-200">Create Binding Agreements</h4>
                <p className="text-gray-500 dark:text-gray-400">Use BoardTAU to establish digital paper trails of lease contracts and deposit terms.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md mt-1 border border-gray-100 dark:border-gray-700">
                <FaFireExtinguisher className="text-red-500 text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-lg dark:text-gray-200">Legal Compliance</h4>
                <p className="text-gray-500 dark:text-gray-400">Ensure all local Camiling fire safety standards are met (fire extinguishers, designated exits) to avoid liability.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 translate-x-4 translate-y-4 rounded-3xl opacity-20 dark:opacity-40"></div>
          <img src="https://picsum.photos/seed/hostSafety/800/800" alt="Host Safety" className="rounded-3xl relative z-10 object-cover w-full h-[500px] shadow-2xl transition-transform duration-500 hover:scale-[1.02]" />
        </div>
      </div>
    </FooterPageLayout>
  );
}
