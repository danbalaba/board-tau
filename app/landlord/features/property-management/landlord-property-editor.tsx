'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave, FaImages } from 'react-icons/fa';
import { Type, ShieldCheck, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';
import LoadingAnimation from '@/components/common/LoadingAnimation';
import { usePropertyFormLogic } from './hooks/use-property-form-logic';
import { LandlordPropertyBasicsForm } from './components/landlord-property-basics-form';
import { LandlordPropertyRulesConfig } from './components/landlord-property-rules-config';
import { LandlordPropertyAmenitiesSelector } from './components/landlord-property-amenities-selector';
import { LandlordPropertyMediaUploader } from './components/landlord-property-media-uploader';

interface LandlordPropertyEditorProps {
  initialData: any;
}

export function LandlordPropertyEditor({ initialData }: LandlordPropertyEditorProps) {
  const router = useRouter();
  const {
    formData,
    setFormData,
    errors,
    isSubmitting,
    isMounted,
    activeSection,
    setActiveSection,
    handleImageChange,
    deleteExistingImage,
    handleSubmitForm,
    getSafeImageSrc
  } = usePropertyFormLogic(initialData);

  const isEditing = !!initialData?.id;

  return (
    <div className="w-full relative min-h-screen pb-32 transition-all duration-500">
      <AnimatePresence>
        {!isMounted ? (
          <div key="loader" className="fixed inset-0 z-[200] flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
            <LoadingAnimation text="Synchronizing property editor..." size="large" />
          </div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Page Header Area */}
            <div className="max-w-4xl mx-auto px-4 md:px-8 mt-10">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl mb-12"
              >
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => router.back()}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm hover:scale-110 active:scale-95 transition-all text-gray-400 hover:text-primary"
                  >
                    <FaArrowLeft size={18} />
                  </button>
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                      {isEditing ? (
                        <>
                          <span className="text-primary">{formData.categories[0] || 'Property'}</span> Editor
                        </>
                      ) : (
                        "New Listing"
                      )}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-[10px] mt-1 space-x-2">
                      {isEditing ? (
                        <>
                          <span>Managing:</span>
                          <span className="text-primary">{formData.title}</span>
                          <span className="text-gray-300">•</span>
                          <span>ID: {initialData.id.slice(0, 8)}...</span>
                        </>
                      ) : (
                        <>
                          <span>Status:</span>
                          <span className="text-emerald-500">Drafting</span>
                          <span className="text-gray-300">•</span>
                          <span>Create a new rental listing</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-8">
              <div className="flex flex-col lg:flex-row gap-8 items-start relative">
                
                {/* Navigation Tracker */}
                <motion.div 
                  initial={{ opacity: 0, x: -40, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  className="hidden xl:flex flex-col items-center gap-1 fixed top-[160px] left-1/2 -ml-[540px] 2xl:-ml-[580px] z-[100] p-8 bg-white/20 dark:bg-black/20 backdrop-blur-xl rounded-[3rem] border border-white/30 dark:border-white/10 shadow-3xl"
                >
                  {[
                    { id: 'basics', title: 'Basics', icon: Type },
                    { id: 'config', title: 'Config', icon: ShieldCheck },
                    { id: 'amenities', title: 'Extras', icon: Wifi },
                    { id: 'showcase', title: 'Media', icon: FaImages },
                  ].map((step, idx, arr) => {
                    const isActive = activeSection === step.id;
                    return (
                      <React.Fragment key={step.id}>
                        <button
                          type="button"
                          onClick={() => document.getElementById(step.id)?.scrollIntoView({ behavior: 'smooth' })}
                          className="group relative flex flex-col items-center gap-3 shrink-0"
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-500",
                              isActive ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-125" : "text-gray-300 dark:text-gray-700 border-gray-100 dark:border-gray-800 hover:border-primary/50"
                            )}
                          >
                            <step.icon size={16} />
                          </div>
                        </button>
                        {idx < arr.length - 1 && (
                          <div className={cn("w-[2px] h-10 my-1 transition-colors duration-1000 shrink-0", isActive ? "bg-primary" : "bg-gray-100 dark:bg-gray-800")} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </motion.div>

                {/* Form Content */}
                <div className="flex-1 w-full overflow-hidden">
                  <form onSubmit={handleSubmitForm}>
                    <div className="space-y-0 w-full">
                      <LandlordPropertyBasicsForm 
                        formData={formData} 
                        setFormData={setFormData} 
                        errors={errors} 
                        setActiveSection={setActiveSection} 
                      />
                      <LandlordPropertyRulesConfig 
                        formData={formData} 
                        setFormData={setFormData} 
                        setActiveSection={setActiveSection} 
                      />
                      <LandlordPropertyAmenitiesSelector 
                        formData={formData} 
                        setFormData={setFormData} 
                        setActiveSection={setActiveSection} 
                      />
                      <LandlordPropertyMediaUploader 
                        formData={formData} 
                        setFormData={setFormData} 
                        setActiveSection={setActiveSection} 
                        handleImageChange={handleImageChange} 
                        deleteExistingImage={deleteExistingImage} 
                        getSafeImageSrc={getSafeImageSrc} 
                      />
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-12 flex items-center justify-between gap-4 p-6 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl">
                      <Button outline onClick={() => router.back()} disabled={isSubmitting} className="rounded-xl px-5 py-3 text-[10px] uppercase tracking-widest w-fit">
                        Discard Updates
                      </Button>
                      <Button onClick={() => handleSubmitForm()} isLoading={isSubmitting} className="rounded-xl px-12 py-3 shadow-lg shadow-primary/20 flex items-center gap-2 group w-fit">
                        <FaSave size={13} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {isEditing ? 'Push Changes' : 'Publish Listing'}
                        </span>
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
