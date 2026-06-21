import FooterPageLayout from '@/components/layout/FooterPageLayout';

export default function OurMissionContent() {
  return (
    <FooterPageLayout
      title="Our Mission"
      description="To democratize access to high-quality, student-friendly boarding houses."
      lastUpdated="April 2026"
    >
      <div className="mb-16 relative w-full h-[500px] rounded-[3rem] overflow-hidden group shadow-2xl">
        <div className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-[3000ms] bg-[url('https://picsum.photos/seed/boardTAUmission/1600/900')]"></div>
        <div className="absolute inset-0 bg-black bg-opacity-60 group-hover:bg-opacity-50 transition-all duration-1000 flex items-center justify-center">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white text-center tracking-tight px-4 leading-tight drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
            Empowering <span className="text-green-400">Students.</span><br />
            Elevating <span className="text-blue-400">Lifestyles.</span>
          </h2>
        </div>
      </div>

      <div className="max-w-3xl mx-auto text-center space-y-8">
        <p className="text-2xl text-gray-700 dark:text-gray-300 leading-relaxed font-light">
          We believe that a student's living environment deeply impacts their academic performance. By organizing the fragmented un-digitalized housing market around TAU, we are removing unnecessary friction and anxiety from the college experience.
        </p>
        
        <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full"></div>
        
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">
          Whether you're looking for an affordable bedspacer slot or a premium studio room, our mission is to ensure you find exactly where you belong.
        </p>
      </div>
    </FooterPageLayout>
  );
}
