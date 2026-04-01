// app/admin/features/moderation/components/listings-review/index.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  ShieldCheck, 
  RefreshCcw, 
  Search, 
  Download,
  AlertCircle,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/app/admin/components/ui/button';
import { toast } from 'sonner';
import { ListingKPICards } from './listing-kpi-cards';
import { ListingQueue } from './listing-queue';
import { ListingReviewCard } from './listing-review-card';
import { cn } from '@/lib/utils';

// Original sample data
const initialListings = [
  {
    id: 1,
    title: 'Cozy Studio Apartment in CBD',
    location: 'Central Business District, Singapore',
    price: 1200,
    rooms: 1,
    bathrooms: 1,
    description: 'A beautifully furnished studio apartment located in the heart of Singapore\'s CBD. Perfect for young professionals looking for convenient living. High-speed internet included.',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
    status: 'pending',
    host: {
      name: 'Jane Doe',
      avatar: 'https://i.pravatar.cc/150?u=jane',
      email: 'jane.doe@example.com'
    },
    submittedAt: '2024-01-15T09:30:00'
  },
  {
    id: 2,
    title: 'Spacious 2-Bedroom in Tiong Bahru',
    location: 'Tiong Bahru, Singapore',
    price: 2800,
    rooms: 2,
    bathrooms: 2,
    description: 'A spacious 2-bedroom apartment with modern amenities in the trendy Tiong Bahru area. Close to cafes, shops, and public transport. Fully renovated kitchen.',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
    status: 'pending',
    host: {
      name: 'John Smith',
      avatar: 'https://i.pravatar.cc/150?u=john',
      email: 'john.smith@example.com'
    },
    submittedAt: '2024-01-14T14:45:00'
  },
  {
    id: 3,
    title: 'Modern Condo in Sentosa Cove',
    location: 'Sentosa Cove, Singapore',
    price: 4500,
    rooms: 3,
    bathrooms: 3,
    description: 'Luxury living at its finest in Sentosa Cove. This modern condo offers stunning sea views and access to premium amenities. Infinity pool and private gym included.',
    images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    status: 'pending',
    host: {
      name: 'Michael Johnson',
      avatar: 'https://i.pravatar.cc/150?u=michael',
      email: 'michael.johnson@example.com'
    },
    submittedAt: '2024-01-13T11:20:00'
  }
];

export function ListingsReviewDashboard() {
  const [listings, setListings] = useState(initialListings);
  const [selectedListing, setSelectedListing] = useState(initialListings[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setIsRefreshing(false);
    toast.success('Market inventory synchronized.');
  };

  const handleAction = (id: number, status: string) => {
    setListings(ls => ls.map(l => l.id === id ? { ...l, status } : l));
    toast.success(`Listing ${status} successfully.`);
    // Automatically move to the next pending listing
    const nextItem = listings.find(l => l.id !== id && l.status === 'pending');
    if (nextItem) setSelectedListing(nextItem);
  };

  const pendingCount = listings.filter(l => l.status === 'pending').length;
  const approvedCount = listings.filter(l => l.status === 'approved').length;
  const rejectedCount = listings.filter(l => l.status === 'rejected').length;

  return (
    <div className="p-6 lg:p-10 space-y-12">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/50 pb-10">
        <div className="space-y-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black tracking-tighter text-foreground uppercase flex items-center gap-4"
          >
            Listing Assets
            <span className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-2xl border border-primary/10 text-primary text-[10px] tracking-[0.2em] font-black italic">
              INSPECTION REQUIRED
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground font-medium text-sm flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Vetting property listings for quality and compliance
          </motion.p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className={cn("h-11 w-11 rounded-xl border-border/60", isRefreshing && "animate-spin")}
          >
            <RefreshCcw className="w-4 h-4 text-primary" />
          </Button>

          <Button
            variant="default"
            className="h-11 px-8 gap-3 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95 text-white"
          >
            <Download className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Inventory Report</span>
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <ListingKPICards 
        total={listings.length} 
        pending={pendingCount} 
        approved={approvedCount} 
        rejected={rejectedCount} 
      />

      {/* Main Grid: List + Details */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1 space-y-6">
          <div className="flex items-center gap-3 pl-4 border-l-[3px] border-emerald-500">
            <LayoutGrid className="w-5 h-5 text-emerald-500" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/70">Review Stack</h2>
          </div>
          <ListingQueue 
            listings={listings} 
            selectedId={selectedListing.id} 
            onSelect={setSelectedListing} 
          />
        </div>

        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center gap-3 pl-4 border-l-[3px] border-amber-500">
            <Building2 className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/70">Property Inspector</h2>
          </div>
          <motion.div
            key={selectedListing.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <ListingReviewCard 
              listing={selectedListing} 
              onApprove={(id) => handleAction(id, 'approved')}
              onReject={(id) => handleAction(id, 'rejected')}
              onModify={(id) => handleAction(id, 'modification')}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
