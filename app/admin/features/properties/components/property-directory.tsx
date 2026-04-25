'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Badge } from '@/app/admin/components/ui/badge';
import {
  IconSearch,
  IconFilter,
  IconPlus,
  IconBuildingCommunity,
  IconMapPin,
  IconStar,
  IconUsers,
  IconDotsVertical,
  IconLayoutGrid,
  IconList,
  IconHomeHeart,
  IconCircleCheckFilled,
  IconChartBar,
  IconArrowUpRight
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance';
  price: number;
  rating: number;
  occupancy: number;
  image: string;
}

const properties: Property[] = [
  {
    id: '1',
    name: 'Luxury Sky Studio',
    location: 'Central Business District, Singapore',
    type: 'Studio',
    status: 'available',
    price: 3200,
    rating: 4.9,
    occupancy: 95,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400&h=250'
  },
  {
    id: '2',
    name: 'Garden View Suite',
    location: 'Tiong Bahru, Singapore',
    type: '1 Bedroom',
    status: 'occupied',
    price: 4500,
    rating: 4.7,
    occupancy: 100,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400&h=250'
  },
  {
    id: '3',
    name: 'Modern Loft',
    location: 'Holland Village, Singapore',
    type: '2 Bedrooms',
    status: 'maintenance',
    price: 5800,
    rating: 4.5,
    occupancy: 0,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=400&h=250'
  },
  {
    id: '4',
    name: 'Urban Penthouse',
    location: 'Marina Bay, Singapore',
    type: '3+ Bedrooms',
    status: 'available',
    price: 12000,
    rating: 5.0,
    occupancy: 88,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400&h=250'
  }
];

const statusStyles = {
  available: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  occupied: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  maintenance: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
};

export function PropertyDirectory() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const kpis = [
    { label: 'Total Units', value: '1,428', trend: '+12%', icon: IconBuildingCommunity, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Global Occupancy', value: '94.2%', trend: '+2.1%', icon: IconUsers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Avg Rating', value: '4.85', trend: 'Top 1%', icon: IconStar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'RevPAR (Daily)', value: '$240', trend: '+15.2%', icon: IconHomeHeart, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  ];

  return (
    <PageContainer>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-3xl font-bold tracking-tight">Asset Command Center</h2>
            <p className="text-muted-foreground text-sm mt-1">Orchestrate global property inventory, performance tracking and listing control.</p>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex rounded-lg border bg-card/50 backdrop-blur-md p-1 shadow-sm">
              <Button 
                variant={view === 'grid' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setView('grid')}
              >
                <IconLayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant={view === 'list' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setView('list')}
              >
                <IconList className="h-4 w-4" />
              </Button>
            </div>
            <Button className="h-10 gap-2 font-bold uppercase tracking-tighter shadow-lg shadow-primary/20">
              <IconPlus className="h-4 w-4" /> Register Property
            </Button>
          </motion.div>
        </div>

        {/* Global summary banner */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group relative overflow-hidden border-none bg-card/50 backdrop-blur-sm shadow-md hover:shadow-xl transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-muted-foreground">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest">{stat.label}</CardTitle>
                  <div className={cn("p-2 rounded-lg", stat.bg)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tabular-nums tracking-tighter">{stat.value}</div>
                  <div className="flex items-center mt-1 space-x-1">
                    <IconArrowUpRight className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500">{stat.trend}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">growth index</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search & Filtering */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search by name, location or asset ID..." 
              className="h-12 pl-10 bg-card/30 backdrop-blur-md border-border/40 shadow-sm transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="outline" className="h-12 gap-2 shadow-sm font-semibold border-border/40 bg-card/30 backdrop-blur-md">
            <IconFilter className="h-4 w-4" /> Advanced Filters
          </Button>
        </motion.div>

        {/* Property Grid/List */}
        <div className={view === 'grid' ? "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4" : "flex flex-col gap-4"}>
          <AnimatePresence mode="popLayout">
            {properties.map((property, idx) => (
              <motion.div
                key={property.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={cn(
                  "group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-md hover:shadow-2xl hover:border-primary/20 transition-all duration-300",
                  view === 'list' && 'flex flex-row items-center p-2'
                )}>
                  <div className={cn(
                    "relative overflow-hidden",
                    view === 'grid' ? 'aspect-[4/3]' : 'h-32 w-48 rounded-xl shrink-0'
                  )}>
                    <img 
                      src={property.image} 
                      alt={property.name} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Button size="sm" variant="secondary" className="w-full gap-2 font-black uppercase text-[9px] h-8 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20">
                        <IconChartBar className="h-3 w-3" /> Management Portal
                      </Button>
                    </div>
                    <Badge className={cn(
                      "absolute left-3 top-3 border-none shadow-lg uppercase font-black text-[8px] px-2 h-5",
                      statusStyles[property.status]
                    )}>
                      {property.status}
                    </Badge>
                  </div>
                  
                  <div className={cn("flex-1", view === 'grid' ? 'p-5' : 'px-6')}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className="font-black text-sm tracking-tight leading-tight truncate">{property.name}</h3>
                          {property.rating >= 4.9 && <IconCircleCheckFilled className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-black tracking-tighter truncate">
                          <IconMapPin className="h-2.5 w-2.5" /> {property.location}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border/20 pt-4">
                      <div>
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Base Rate</p>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-sm font-black">$</span>
                          <span className="text-lg font-black tabular-nums">{property.price.toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-muted-foreground">/mo</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Occupancy</p>
                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                          <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={cn("h-full rounded-full transition-all duration-1000", property.occupancy > 90 ? 'bg-emerald-500' : 'bg-primary')} 
                              style={{ width: `${property.occupancy}%` }} 
                            />
                          </div>
                          <p className="text-lg font-black tabular-nums leading-none">{property.occupancy}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </PageContainer>
  );
}
