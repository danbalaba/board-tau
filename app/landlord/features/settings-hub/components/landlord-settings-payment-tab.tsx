'use client';

import React from 'react';
import { CreditCard } from 'lucide-react';

export function LandlordSettingsPaymentTab() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col items-center text-center">
        <div className="p-4 bg-primary/10 rounded-[2rem] text-primary mb-5 shadow-inner">
          <CreditCard size={40} />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
          Payment Method
        </h2>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
          Configure how you receive payouts
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-1 mb-2">
          <div className="w-6 h-1 bg-primary rounded-full" />
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Available Payout Gateways</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: 'Stripe Connect', desc: 'Secure worldwide card processing & automated payouts.' },
            { name: 'PayMongo Gateway', desc: 'Optimized for GCash, Maya, and local bank transfers.' },
            { name: 'Direct Bank Settlement', desc: 'Traditional wire transfer to your business account.' },
          ].map((gate) => (
            <div key={gate.name} className="p-8 bg-white/40 dark:bg-gray-800/20 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:bg-white dark:hover:bg-gray-800/40 transition-all group">
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wider">{gate.name}</h3>
                <p className="text-xs font-medium text-gray-500 mb-8 leading-relaxed">{gate.desc}</p>
              </div>
              <button className="relative overflow-hidden w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-primary hover:text-white px-5 py-3 rounded-2xl font-black transition-all text-[9px] uppercase tracking-[0.2em] border border-transparent group-hover:shadow-lg">
                Setup {gate.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
