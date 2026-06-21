import FooterPageLayout from '@/components/layout/FooterPageLayout';
import { FaGraduationCap, FaMapMarkedAlt, FaLaptopCode, FaHandshake } from 'react-icons/fa';
import Link from 'next/link';

export default function AboutBoardTAUContent() {
  return (
    <FooterPageLayout
      title="About BoardTAU"
      description="We are a dedicated team driven to revolutionize student accommodation around Tarlac Agricultural University."
      lastUpdated="April 2026"
    >
      <div className="mb-16 relative rounded-3xl overflow-hidden group shadow-xl">
        <img src="https://picsum.photos/seed/boardtaucampus/1200/500" alt="TAU Campus Experience" className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent flex flex-col justify-end p-8 md:p-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">From Students, For Students.</h2>
          <p className="text-xl text-gray-200 max-w-2xl drop-shadow-md">
            BoardTAU connects students of Tarlac Agricultural University with reputable landlords. We streamline the entire process of finding housing, removing stress and friction so you can focus on your studies.
          </p>
        </div>
      </div>

      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-6 dark:text-white">Our Capstone Journey</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Founded as a capstone project by IT students, BoardTAU is deeply rooted in the goal of supporting student welfare. We experienced the housing struggle ourselves and decided to build a permanent, digital solution.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600 dark:text-green-400">
                  <FaLaptopCode />
                </div>
                <strong>Modern Tech Stack:</strong> React, Next.js, and sophisticated UI architecture.
              </li>
              <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400">
                  <FaMapMarkedAlt />
                </div>
                <strong>Locally Focused:</strong> Serving the specific landscape of Camiling, Tarlac.
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center transform transition-transform hover:-translate-y-2 hover:shadow-xl duration-300">
              <h4 className="text-4xl font-extrabold text-green-500 mb-2">500+</h4>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Active Listings</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center transform transition-transform hover:-translate-y-2 hover:shadow-xl duration-300 mt-8">
              <h4 className="text-4xl font-extrabold text-blue-500 mb-2">12k+</h4>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Students Helped</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center transform transition-transform hover:-translate-y-2 hover:shadow-xl duration-300 -mt-8">
              <h4 className="text-4xl font-extrabold text-purple-500 mb-2">100%</h4>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Verified Hosts</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center transform transition-transform hover:-translate-y-2 hover:shadow-xl duration-300">
              <h4 className="text-4xl font-extrabold text-orange-500 mb-2">24/7</h4>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Support Access</p>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-gray-50 dark:bg-[#161616] rounded-3xl p-8 md:p-12 text-center border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-lg">
        <FaHandshake className="text-6xl text-gray-300 dark:text-gray-700 mx-auto mb-6 hover:rotate-12 transition-transform duration-500" />
        <h3 className="text-2xl font-bold mb-4 dark:text-white">Partner with Us</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
          Are you a landlord aiming to reach thousands of incoming students efficiently? List your boarding house today with BoardTAU.
        </p>
        <Link href="/hosting/list">
          <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-2xl hover:-translate-y-1 focus:ring focus:ring-gray-300">
            Learn About Hosting
          </button>
        </Link>
      </div>

    </FooterPageLayout>
  );
}
