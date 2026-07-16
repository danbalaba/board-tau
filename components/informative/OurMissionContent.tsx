import FooterPageLayout from '@/components/layout/FooterPageLayout';
import Link from 'next/link';

export default function OurMissionContent() {
  return (
    <FooterPageLayout
      title="Careers at BoardTAU"
      description="Help us build the future of student accommodations."
      lastUpdated="June 2026"
    >
      <div className="space-y-6">
        <p>
          At BoardTAU, we are a fast-growing technology company dedicated to solving the housing crisis for university students. We are always on the lookout for passionate engineers, designers, and community managers who want to make a tangible impact.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Why Join Us?</h2>
        <p>
          We believe in fostering a culture of innovation, continuous learning, and empathy. When you join BoardTAU, you're not just taking a job; you're joining a mission to provide safe, affordable, and accessible housing to thousands of students.
        </p>
        
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Impact-Driven Work:</strong> See the direct results of your code and design on the daily lives of our users.</li>
          <li><strong>Modern Technology:</strong> Work with a cutting-edge stack including Next.js, TypeScript, and cloud infrastructure.</li>
          <li><strong>Flexible Environment:</strong> We support flexible working arrangements and prioritize work-life balance.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Open Positions</h2>
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl">
          <h3 className="text-xl font-medium mb-2">Senior Full-Stack Engineer</h3>
          <p className="text-sm text-gray-500 mb-4">Remote · Full-time</p>
          <p className="mb-4">
            We are looking for an experienced engineer to help scale our real-time messaging architecture and optimize our search algorithms.
          </p>
          <button className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-medium hover:opacity-80 transition-opacity">
            Apply Now
          </button>
        </div>

        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl mt-4">
          <h3 className="text-xl font-medium mb-2">Community Support Specialist</h3>
          <p className="text-sm text-gray-500 mb-4">Tarlac City · Full-time</p>
          <p className="mb-4">
            Join our Trust and Safety team to help onboard new hosts, verify listings, and ensure our community guidelines are upheld.
          </p>
          <button className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-medium hover:opacity-80 transition-opacity">
            Apply Now
          </button>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Don't see a role that fits? Send your resume to <a href="mailto:careers@boardtau.com" className="underline">careers@boardtau.com</a> and we'll keep you in mind for future opportunities.
        </p>
      </div>
    </FooterPageLayout>
  );
}
