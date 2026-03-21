'use client';

import React from 'react';
import { Modal } from '@/app/admin/components/ui/modal';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import {
  IconCreditCard,
  IconCashBanknote,
  IconGavel
} from '@tabler/icons-react';

interface PaymentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentSettingsModal({ isOpen, onClose }: PaymentSettingsModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      title="Payment Settings"
      description="Manage your payment preferences"
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Default Payment Method */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Default Payment Method
          </h3>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <IconCreditCard className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Expires 12/2026</p>
              </div>
              <div className="ml-auto">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                  Default
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Payment Method */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Add New Payment Method
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input
              id="cardName"
              placeholder="John Doe"
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="0000 0000 0000 0000"
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                className="pl-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Payout Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Payout Settings
          </h3>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-3">
              <IconCashBanknote className="w-4 h-4 text-green-500" />
              <Label htmlFor="autoPayout">Automatic Payouts</Label>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Payouts will be automatically transferred to your bank account within 24 hours of booking confirmation.
          </p>
        </div>

        {/* Save Button */}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <IconGavel className="w-4 h-4" />
              Save Changes
            </div>
          )}
        </Button>
      </form>
    </Modal>
  );
}
