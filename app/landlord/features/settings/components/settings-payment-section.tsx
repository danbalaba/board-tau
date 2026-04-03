'use client';

import React from 'react';
import { CreditCard } from 'lucide-react';

export default function SettingsPaymentSection() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <CreditCard size={24} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          Payment Settings
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'Stripe', desc: 'Accept credit card payments worldwide.' },
          { name: 'PayMongo', desc: 'GCash, Maya, and local card payments.' },
          { name: 'Bank Transfer', desc: 'Direct deposit to your local bank account.' },
        ].map((gate) => (
          <div key={gate.name} className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{gate.name}</h3>
              <p className="text-sm text-gray-500 mb-8">{gate.desc}</p>
            </div>
            <button className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-900 text-primary border border-primary/20 hover:bg-primary hover:text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm text-sm">
              Configure {gate.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
