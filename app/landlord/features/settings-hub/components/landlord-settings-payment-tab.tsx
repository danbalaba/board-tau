'use client';

import React from 'react';
import { IconCreditCard, IconBuildingBank, IconWallet, IconChecks } from '@tabler/icons-react';
import { cn } from '@/utils/helper';

export function LandlordSettingsPaymentTab() {
  const gateways = [
    { 
      name: 'Stripe Connect', 
      desc: 'Secure worldwide card processing & automated payouts.', 
      icon: IconCreditCard, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      connected: true 
    },
    { 
      name: 'PayMongo Gateway', 
      desc: 'Optimized for GCash, Maya, and local bank transfers.', 
      icon: IconWallet, 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-500/10',
      connected: false 
    },
    { 
      name: 'Direct Settlement', 
      desc: 'Traditional wire transfer to your business account.', 
      icon: IconBuildingBank, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      connected: false 
    },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3 px-1">
        <div className="w-6 h-1 bg-primary rounded-full" />
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Available Payout Gateways</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gateways.map((gate) => (
          <div key={gate.name} className="p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
            {gate.connected && (
              <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                <IconChecks size={12} stroke={3} />
                <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
              </div>
            )}
            
            <div>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", gate.bg)}>
                <gate.icon size={28} className={gate.color} />
              </div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wider">{gate.name}</h3>
              <p className="text-xs font-medium text-gray-500 mb-8 leading-relaxed">{gate.desc}</p>
            </div>
            
            <button className={cn(
              "relative overflow-hidden w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-black transition-all text-[10px] uppercase tracking-[0.2em] border",
              gate.connected 
                ? "bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 cursor-default" 
                : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-primary hover:text-white border-transparent"
            )}>
              {gate.connected ? 'Account Connected' : `Setup ${gate.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
