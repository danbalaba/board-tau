import FooterPageLayout from '@/components/layout/FooterPageLayout';
import { FaLaptopCode, FaReact, FaNodeJs } from 'react-icons/fa';
import { SiNextdotjs, SiTailwindcss, SiTypescript } from 'react-icons/si';

export default function CapstoneProjectContent() {
  return (
    <FooterPageLayout
      title="Capstone Project Overview"
      description="BoardTAU is a state-of-the-art web application developed entirely by students to solve a very real campus problem."
      lastUpdated="April 2026"
    >
      <div className="bg-gray-900 text-white rounded-3xl p-8 md:p-12 mb-16 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FaLaptopCode className="text-[200px]" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-6">Born from Necessity</h2>
          <p className="text-gray-300 text-lg max-w-2xl leading-relaxed mb-6">
            Every semester, hundreds of incoming freshmen struggle to find suitable boarding houses around Tarlac Agricultural University. Our thesis group experienced this directly, leading us to engineer a centralized platform that connects verified landlords with active students.
          </p>
          <span className="inline-block bg-white text-gray-900 font-bold px-6 py-2 rounded-full uppercase tracking-wider text-xs shadow-md">
            Academic Year 2025-2026
          </span>
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-8 text-center dark:text-white">Our Technology Stack</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 px-4">
        
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:-translate-y-2 hover:shadow-lg transition-all duration-300">
          <SiNextdotjs className="text-5xl text-black dark:text-white mb-4" />
          <h4 className="font-bold text-gray-800 dark:text-gray-200">Next.js</h4>
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:-translate-y-2 hover:shadow-lg transition-all duration-300">
          <FaReact className="text-5xl text-blue-500 mb-4" />
          <h4 className="font-bold text-gray-800 dark:text-gray-200">React</h4>
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:-translate-y-2 hover:shadow-lg transition-all duration-300">
          <SiTypescript className="text-5xl text-blue-600 mb-4" />
          <h4 className="font-bold text-gray-800 dark:text-gray-200">TypeScript</h4>
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:-translate-y-2 hover:shadow-lg transition-all duration-300">
          <SiTailwindcss className="text-5xl text-cyan-400 mb-4" />
          <h4 className="font-bold text-gray-800 dark:text-gray-200">Tailwind CSS</h4>
        </div>
        
      </div>
    </FooterPageLayout>
  );
}
