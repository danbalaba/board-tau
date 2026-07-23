"use client";
import FooterPageLayout from '@/components/layout/FooterPageLayout';
import { FaCheckCircle, FaCalendarCheck, FaStar, FaChevronRight } from 'react-icons/fa';
import { InteractiveCard } from '@/components/lightswind/interactive-card';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HowBookingWorksContent() {
  return (
    <FooterPageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
      <section className="space-y-16 py-8 relative before:absolute before:inset-0 before:ml-5 md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:-translate-x-px md:before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-800 before:to-transparent">
        
        {/* Step 1 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-[#0f0f0f] bg-green-500 shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-125">
            <FaSearch className="text-white text-sm" />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group-hover:border-green-500/50">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-black tracking-widest text-green-500 uppercase">Step 1</span>
              <h3 className="text-2xl font-bold dark:text-white">Find Your Perfect Place</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Use our advanced filters to find places near TAU that fit your exact budget, gender preference, and amenities requirements.
              </p>
              <img src="https://picsum.photos/seed/boardtau1/600/300" alt="Search Interface" className="w-full h-48 object-cover rounded-xl mt-4 opacity-90 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-[#0f0f0f] bg-blue-500 shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-125">
            <FaCalendarCheck className="text-white text-sm" />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group-hover:border-blue-500/50">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-black tracking-widest text-blue-500 uppercase">Step 2</span>
              <h3 className="text-2xl font-bold dark:text-white">Reserve or Request Securely</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Communicate directly with verified landlords. Send a booking request knowing our platform helps secure the transaction smoothly.
              </p>
              <div className="flex gap-4 mt-6">
                <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl flex items-center gap-3 border border-transparent group-hover:border-blue-500/30 transition-colors">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <span className="text-sm font-medium dark:text-gray-300">Instant Book</span>
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl flex items-center gap-3 border border-transparent group-hover:border-blue-500/30 transition-colors">
                  <FaCheckCircle className="text-blue-500 text-xl" />
                  <span className="text-sm font-medium dark:text-gray-300">Identity Checked</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-[#0f0f0f] bg-yellow-500 shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-125">
            <FaStar className="text-white text-sm" />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group-hover:border-yellow-500/50">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-black tracking-widest text-yellow-500 uppercase">Step 3</span>
              <h3 className="text-2xl font-bold dark:text-white">Move In & Review</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Move into your new home comfortably. End of semester? Leave a detailed review to help future students find great boarding houses.
              </p>
              <img src="https://picsum.photos/seed/boardtau2/600/300" alt="Review Interface" className="w-full h-48 object-cover rounded-xl mt-4 opacity-90 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

      </section>

      <InteractiveCard
        className="mt-12 mx-auto w-full max-w-4xl !aspect-auto"
        tailwindBgClass="bg-gray-900 dark:bg-white"
        InteractiveColor="#22c55e"
      >
        <div className="group cursor-pointer rounded-2xl p-8 flex items-center justify-between transition-all duration-500 text-white dark:text-gray-900 relative z-20">
          <div className="text-left">
            <h2 className="text-3xl font-bold mb-2">Ready to find a place?</h2>
            <p className="text-gray-400 dark:text-gray-600">Start exploring hundreds of listings around TAU.</p>
          </div>
          <div className="bg-green-500 p-4 rounded-full group-hover:translate-x-4 transition-transform duration-500 shadow-lg relative z-20">
            <FaChevronRight className="text-white text-2xl" />
          </div>
        </div>
      </InteractiveCard>
      </motion.div>
    </FooterPageLayout>
  );
}

const FaSearch = ({className}: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
