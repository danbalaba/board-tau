// app/admin/features/moderation/components/listings-review/listing-queue.tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/admin/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/admin/components/ui/avatar';
import { Mail, MapPin, Calendar, Clock, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ListingQueueProps {
  listings: any[];
  selectedId: number;
  onSelect: (listing: any) => void;
}

export function ListingQueue({ listings, selectedId, onSelect }: ListingQueueProps) {
  const pendingListings = listings.filter(l => l.status === 'pending');

  return (
    <Card className="h-[calc(100vh-280px)] border-border/40 bg-card/10 backdrop-blur-md overflow-hidden flex flex-col">
      <CardHeader className="border-b border-border/40 py-5 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-black uppercase tracking-widest">Listings Queue</CardTitle>
          </div>
          <span className="flex items-center justify-center bg-primary/10 text-primary text-[10px] font-black w-6 h-6 rounded-full border border-primary/20">
            {pendingListings.length}
          </span>
        </div>
        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 italic font-medium">Pending Review</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-4">
          <AnimatePresence>
            {listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "group relative p-4 rounded-2xl border-2 transition-all cursor-pointer",
                  selectedId === listing.id 
                    ? "bg-primary/[0.04] border-primary/40 shadow-lg shadow-primary/5" 
                    : "bg-background/20 border-border/40 hover:border-border hover:bg-background/50 hover:shadow-md"
                )}
                onClick={() => onSelect(listing)}
              >
                {selectedId === listing.id && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                  />
                )}
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[11px] font-black leading-relaxed uppercase tracking-widest text-foreground/90 line-clamp-1">
                      {listing.title}
                    </h3>
                    <div className={cn(
                      "flex-shrink-0 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm",
                      listing.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      listing.status === 'approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    )}>
                      {listing.status}
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-border/20 pt-3 mt-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 tracking-tight">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{listing.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary tracking-widest uppercase">
                      <span className="text-xs font-black">₱{listing.price}</span>
                      <span className="text-muted-foreground/40 font-medium tracking-tighter">/MONTH</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-dotted border-t border-border/20 mt-1">
                    <div className="flex items-center">
                      <Avatar className="h-5 w-5 border border-border/60 p-0.5 grayscale group-hover:grayscale-0 transition-all">
                        <AvatarImage src={listing.host.avatar} />
                        <AvatarFallback className="text-[10px] font-black italic">{listing.host.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 group-hover:text-foreground transition-colors">{listing.host.name}</span>
                    </div>
                    <div className="flex items-center text-[10px] font-black text-muted-foreground/30">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(listing.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

import { AnimatePresence } from 'framer-motion';
