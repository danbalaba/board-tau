// app/admin/features/moderation/components/listings-review/listing-review-card.tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/admin/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/admin/components/ui/avatar';
import { Button } from '@/app/admin/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  ShieldCheck, 
  ShieldAlert, 
  MapPin, 
  Home, 
  Bath, 
  Bed,
  Mail,
  Phone,
  Link,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ListingReviewCardProps {
  listing: any;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onModify: (id: number) => void;
}

export function ListingReviewCard({ listing, onApprove, onReject, onModify }: ListingReviewCardProps) {
  if (!listing) return null;

  return (
    <div className="flex flex-col h-full gap-6">
      <Card className="flex-1 border-border/40 bg-card/20 backdrop-blur-md overflow-hidden flex flex-col">
        <CardHeader className="bg-muted/10 border-b border-border/40 py-6 px-10">
          <div className="flex items-center justify-between gap-6">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Home className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-2xl font-black tracking-tighter uppercase">{listing.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest pl-11">
                <MapPin className="w-4 h-4 text-emerald-500" />
                {listing.location}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="text-3xl font-black tracking-tighter text-emerald-500">
                ₱{listing.price.toLocaleString()}
                <span className="text-xs text-muted-foreground/60 font-medium tracking-tight">/MO</span>
              </div>
              <div className="flex items-center gap-2 bg-background/50 px-2.5 py-1 rounded-xl border border-border/40">
                <span className="text-[10px] font-black italic text-primary">OFFICIAL SUBMISSION</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Bedrooms', val: listing.rooms, icon: Bed, color: 'text-blue-500' },
              { label: 'Bathrooms', val: listing.bathrooms, icon: Bath, color: 'text-emerald-500' },
              { label: 'Total Area', val: '120 SQFT', icon: ShieldCheck, color: 'text-amber-500' },
              { label: 'Floor Level', val: '3rd Floor', icon: TrendingUp, color: 'text-purple-500' }
            ].map((stat, i) => (
              <div key={i} className="bg-card/40 border border-border/40 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 group hover:border-primary/40 transition-all">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
                <span className="text-lg font-black tracking-tighter">{stat.val}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 italic">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {/* Left: Images & Gallery */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pl-4 border-l-[3px] border-emerald-500">
                <ImageIcon className="w-5 h-5 text-emerald-500" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-500">Property Inspection Gallery</h3>
              </div>
              <div className="relative group overflow-hidden rounded-[40px] border-2 border-border/40 bg-muted/20">
                <img 
                  src={listing.images[0]} 
                  alt="Primary View" 
                  className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-6 right-6 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-border/40 flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest">+ {listing.images.length - 1} MORE</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {listing.images.slice(1, 4).map((img: string, i: number) => (
                  <img key={i} src={img} className="w-full aspect-square object-cover rounded-3xl border border-border/40 hover:border-primary/40 transition-all cursor-pointer" />
                ))}
              </div>
            </div>

            {/* Right: Description & Host Info */}
            <div className="space-y-8 flex flex-col h-full">
              {/* Host Metadata */}
              <div className="p-6 rounded-[32px] bg-card/60 border border-border/40 space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-xl p-1 bg-background">
                    <AvatarImage src={listing.host.avatar} />
                    <AvatarFallback className="font-black italic text-xl">{listing.host.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black tracking-tight">{listing.host.name}</h4>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {listing.host.email}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full h-11 rounded-2xl border-border/40 bg-background/50 hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                  View Host Portfolio <Link className="w-3 h-3 ml-2" />
                </Button>
              </div>

              {/* Property Narrative */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 pl-4 border-l-[3px] border-amber-500">
                  <Edit3 className="w-5 h-5 text-amber-500" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-amber-500">Property Narrative</h3>
                </div>
                <div className="p-8 rounded-[32px] bg-muted/30 border border-border/20">
                  <p className="text-sm font-medium leading-relaxed italic text-foreground/80 lowercase first-letter:uppercase">
                    {listing.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-20 bg-card/40 backdrop-blur-2xl border border-border/40 rounded-[32px] p-2 flex items-center justify-between shadow-2xl shadow-primary/10 mb-6"
      >
        <div className="flex items-center gap-4 pl-6">
          <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-widest italic text-muted-foreground/50">Moderation Desk</p>
            <p className="text-xs font-black tracking-tight uppercase">Decision Required</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pr-2">
          <Button 
            variant="outline" 
            onClick={() => onModify(listing.id)}
            className="h-14 px-8 rounded-3xl border-border/40 bg-background/40 hover:bg-background h-full text-[11px] font-black uppercase tracking-widest"
          >
            Request Modification
          </Button>
          <Button 
            onClick={() => onReject(listing.id)}
            className="h-14 px-8 rounded-3xl bg-rose-500 hover:bg-rose-600 text-white shadow-xl shadow-rose-500/20 text-[11px] font-black uppercase tracking-widest"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Decline Listing
          </Button>
          <Button 
            onClick={() => onApprove(listing.id)}
            className="h-14 px-10 rounded-3xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 text-[11px] font-black uppercase tracking-widest"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve Listing
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
