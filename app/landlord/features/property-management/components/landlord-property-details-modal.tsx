'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  IconBuilding, 
  IconEdit, 
  IconEye, 
  IconBath, 
  IconX, 
  IconMapPin, 
  IconCurrencyPeso, 
  IconLayoutGrid,
  IconBed,
  IconUsers,
  IconTag,
  IconCheck,
  IconDimensions,
  IconReceipt2,
  IconCertificate,
  IconWoman,
  IconMan,
  IconFriends,
  IconPaw,
  IconSmoking,
  IconShieldCheck,
  IconDeviceCctv,
  IconFlame,
  IconBus,
  IconBook,
  IconSeeding,
  IconCalendarFilled
} from '@tabler/icons-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';
import LoadingAnimation from '@/components/common/LoadingAnimation';
import { Property } from '../hooks/use-property-logic';

interface PropertyDetailsModalProps {
  property: Property;
  onClose: () => void;
  statusColors: Record<string, string>;
  formatStatus: (status: string) => string;
}

export function LandlordPropertyDetailsModal({
  property,
  onClose,
  statusColors,
  formatStatus
}: PropertyDetailsModalProps) {
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: modalScrollRef });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalStyle || ''; };
  }, []);

  const headerHeight = useTransform(scrollY, [0, 80], [256, 110]);
  const headerContentOpacity = useTransform(scrollY, [0, 60], [1, 0]);
  const compactHeaderOpacity = useTransform(scrollY, [60, 80], [0, 1]);
  const titleScale = useTransform(scrollY, [0, 80], [1, 0.75]);
  const titleY = useTransform(scrollY, [0, 80], [0, -10]);
  const bannerBlur = useTransform(scrollY, [0, 80], ['blur(0px)', 'blur(8px)']);
  const closeButtonBg = useTransform(scrollY, [0, 80], ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.1)']);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 40 }} ref={modalScrollRef} className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] border border-white/20 dark:border-gray-800 max-w-4xl w-full shadow-2xl overflow-y-auto flex flex-col max-h-[90vh] custom-scrollbar">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center py-40 bg-black/30 backdrop-blur-sm">
              <LoadingAnimation text="Synchronizing property details..." size="large" />
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="flex flex-col h-full">
              <motion.div style={{ height: headerHeight }} className="sticky top-0 w-full flex-shrink-0 z-30 group">
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  {property.imageSrc ? (
                    <motion.img style={{ filter: bannerBlur }} src={property.imageSrc} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center"><IconBuilding size={64} className="text-gray-300 dark:text-gray-700" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                
                <motion.div style={{ opacity: headerContentOpacity }} className="absolute bottom-6 left-8 right-8 pointer-events-none">
                  <div className={cn("inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border backdrop-blur-md", statusColors[property.status]?.replace('bg-', 'bg-').replace('/10', '/80') || "bg-gray-500/80 text-white border-white/20")}>
                    {formatStatus(property.status)}
                  </div>
                </motion.div>

                <motion.div style={{ opacity: compactHeaderOpacity }} className="absolute inset-0 bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border-b border-white/10 flex items-center px-10 pointer-events-none">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-xl"><img src={property.imageSrc} className="w-full h-full object-cover" alt="" /></div>
                    <div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-0.5">Quick View</p>
                       <p className="text-sm font-black text-white">{property.title}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div style={{ scale: titleScale, y: titleY }} className="absolute bottom-6 left-8 right-8 z-30 pointer-events-none">
                  <h3 className="text-3xl md:text-plus font-black text-white leading-tight drop-shadow-xl inline-block origin-left">{property.title}</h3>
                  <motion.div style={{ opacity: headerContentOpacity }} className="flex flex-wrap items-center gap-4 mt-2 text-white/80 font-bold text-sm">
                    <div className="flex items-center gap-1.5"><IconMapPin size={16} className="text-primary-foreground" /><span>{property.region}, {property.country}</span></div>
                    {property.user?.businessName && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10"><IconBuilding size={14} className="text-blue-400" /><span className="text-xs uppercase tracking-widest">{property.user.businessName}</span></div>
                    )}
                  </motion.div>
                </motion.div>
                
                <motion.button onClick={onClose} style={{ backgroundColor: closeButtonBg }} className="absolute top-6 right-6 p-2.5 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all border border-white/20 z-50 shadow-xl"><IconX size={20} /></motion.button>
              </motion.div>

              <div className="p-8 md:p-10 z-10 font-bold">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-7 space-y-10">
                    <section>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2"><div className="w-4 h-0.5 bg-primary rounded-full" />About this property</h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base font-medium">{property.description || "No description provided."}</p>
                    </section>

                    <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: 'Monthly', value: `₱${property.price.toLocaleString()}`, icon: IconCurrencyPeso, color: 'text-primary' },
                        { label: 'Rooms', value: property.roomCount, icon: IconBuilding, color: 'text-blue-500' },
                        { label: 'Baths', value: property.bathroomCount, icon: IconBath, color: 'text-purple-500' },
                        { label: 'Category', value: property.categories?.[0]?.category.label || 'N/A', icon: IconTag, color: 'text-orange-500' },
                      ].map((item, i) => (
                        <div key={i} className="bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-transform">
                          <div className={cn("w-10 h-10 rounded-2xl bg-white dark:bg-gray-700 flex items-center justify-center mb-3 shadow-sm border border-gray-100 dark:border-gray-600", item.color)}><item.icon size={18} /></div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                          <p className="text-sm font-black text-gray-900 dark:text-white truncate">{item.value}</p>
                        </div>
                      ))}
                    </section>

                    <section>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2"><div className="w-4 h-0.5 bg-primary rounded-full" />Room Inventory</h4>
                        <span className="text-[10px] font-black bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-500 uppercase tracking-widest">{property.rooms?.length || 0} Units</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {property.rooms?.map((room) => (
                          <div key={room.id} className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative">
                              {room.images?.[0]?.url ? (<img src={room.images?.[0].url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={room.name} />) : (<div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-300"><IconBed size={24} /></div>)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-4 mb-2">
                                <h5 className="font-black text-gray-900 dark:text-white text-sm truncate uppercase tracking-wide">{room.name}</h5>
                                <span className="text-primary font-black text-sm">₱{room.price.toLocaleString()}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 mb-3">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400"><IconUsers size={12} className="text-blue-500" /><span>Cap: {room.capacity}</span></div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400"><IconCheck size={12} className="text-green-500" /><span>Avail: {room.availableSlots}</span></div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400"><IconBed size={12} className="text-purple-500" /><span>{room.bedType} Bed</span></div>
                                {room.size && (<div className="flex items-center gap-1 text-[10px] font-bold text-gray-400"><IconDimensions size={12} className="text-orange-500" /><span>{room.size} sqm</span></div>)}
                                <div className="flex items-center gap-1 text-[10px] font-bold text-teal-500 uppercase tracking-widest bg-teal-50 dark:bg-teal-500/10 px-2 py-0.5 rounded-lg border border-teal-100 dark:border-teal-500/20">{room.roomType}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="lg:col-span-5 space-y-10">
                    <section className="bg-gray-50/80 dark:bg-gray-800/80 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800/50">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2"><IconCertificate size={14} />Property Rules</h4>
                      <div className="space-y-4">
                        {[
                          { key: 'femaleOnly', label: 'Female Only', icon: IconWoman, active: property.rules?.femaleOnly },
                          { key: 'maleOnly', label: 'Male Only', icon: IconMan, active: property.rules?.maleOnly },
                          { key: 'visitorsAllowed', label: 'Visitors Allowed', icon: IconFriends, active: property.rules?.visitorsAllowed },
                          { key: 'petsAllowed', label: 'Pets Allowed', icon: IconPaw, active: property.rules?.petsAllowed },
                          { key: 'smokingAllowed', label: 'Smoking Allowed', icon: IconSmoking, active: property.rules?.smokingAllowed },
                        ].map((rule) => (
                          <div key={rule.key} className={cn("flex items-center justify-between p-3.5 rounded-2xl border transition-all", rule.active ? "bg-white dark:bg-gray-900 border-primary/20 text-gray-900 dark:text-white shadow-sm" : "bg-transparent border-gray-200/50 dark:border-gray-700/50 text-gray-400 opacity-50")}>
                            <div className="flex items-center gap-3"><rule.icon size={16} className={rule.active ? "text-primary" : "text-gray-400"} /><span className="text-xs font-black uppercase tracking-widest">{rule.label}</span></div>
                            {rule.active ? (<IconCheck size={14} className="text-green-500" />) : (<IconX size={14} className="text-gray-300" />)}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 px-6 py-5 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Last Updated</span>
                  <span className="text-[10px] font-black text-gray-600 dark:text-gray-300">{new Date(property.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <Link href={`/landlord/properties/${property.id}/edit`} className="w-full sm:w-auto flex-1 md:flex-none">
                    <Button className="rounded-2xl w-full py-3 px-6 shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group/edit whitespace-nowrap"><IconEdit size={14} className="group-hover/edit:rotate-12 transition-transform" /><span className="text-[10px] font-black uppercase tracking-widest">Full Property Editor</span></Button>
                  </Link>
                  <Button outline onClick={onClose} className="rounded-2xl w-full sm:w-auto py-3 px-8 flex items-center justify-center border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Dismiss</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
