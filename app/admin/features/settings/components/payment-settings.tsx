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
import { Switch } from '@/app/admin/components/ui/switch';
import { Label } from '@/app/admin/components/ui/label';
import { Input } from '@/app/admin/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { Textarea } from '@/app/admin/components/ui/textarea';

export function PaymentSettings() {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save operation
    setTimeout(() => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment & Tax Settings</h2>
          <p className="text-muted-foreground">Configure payment gateways and tax settings</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Gateways</CardTitle>
            <CardDescription>Configure payment gateway integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="stripeEnabled">Stripe Integration</Label>
                <p className="text-sm text-muted-foreground">Enable Stripe payment processing</p>
              </div>
              <Switch id="stripeEnabled" defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
              <Input
                id="stripePublicKey"
                type="text"
                placeholder="pk_test_..."
                defaultValue="pk_test_1234567890abcdef1234567890abcdef"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
              <Input
                id="stripeSecretKey"
                type="password"
                placeholder="sk_test_..."
                defaultValue="sk_test_1234567890abcdef1234567890abcdef"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="paypalEnabled">PayPal Integration</Label>
                <p className="text-sm text-muted-foreground">Enable PayPal payment processing</p>
              </div>
              <Switch id="paypalEnabled" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paypalClientId">PayPal Client ID</Label>
              <Input
                id="paypalClientId"
                type="text"
                placeholder="AeB1c2d3E4F5g6H7i8J9k0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paypalClientSecret">PayPal Client Secret</Label>
              <Input
                id="paypalClientSecret"
                type="password"
                placeholder="AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Settings</CardTitle>
            <CardDescription>Configure tax calculations and compliance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="taxCalculation">Automatic Tax Calculation</Label>
                <p className="text-sm text-muted-foreground">Enable automatic tax calculation</p>
              </div>
              <Switch id="taxCalculation" defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxProvider">Tax Provider</Label>
              <Select>
                <SelectTrigger id="taxProvider">
                  <SelectValue placeholder="Select tax provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe Tax</SelectItem>
                  <SelectItem value="taxjar">TaxJar</SelectItem>
                  <SelectItem value="avatax">Avalara AvaTax</SelectItem>
                  <SelectItem value="manual">Manual Configuration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
              <Input
                id="defaultTaxRate"
                type="number"
                step="0.01"
                defaultValue="8.5"
                placeholder="8.5"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="taxInclusive">Tax Inclusive Pricing</Label>
                <p className="text-sm text-muted-foreground">Prices include tax</p>
              </div>
              <Switch id="taxInclusive" defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRegions">Tax Regions</Label>
              <Textarea
                id="taxRegions"
                placeholder="Enter tax regions (one per line)"
                className="min-h-[100px]"
                defaultValue="Singapore
Malaysia
Indonesia
Thailand
Philippines
Vietnam"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commission Settings</CardTitle>
            <CardDescription>Configure commission and fee structures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hostCommissionRate">Host Commission Rate (%)</Label>
              <Input
                id="hostCommissionRate"
                type="number"
                step="0.01"
                defaultValue="10"
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">
                Percentage of booking amount charged to hosts
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestServiceFee">Guest Service Fee (%)</Label>
              <Input
                id="guestServiceFee"
                type="number"
                step="0.01"
                defaultValue="5"
                placeholder="5"
              />
              <p className="text-xs text-muted-foreground">
                Percentage of booking amount charged to guests
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumBookingFee">Minimum Booking Fee</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="minimumBookingFee"
                  type="number"
                  step="0.01"
                  defaultValue="5"
                  placeholder="5"
                />
                <span className="text-sm text-muted-foreground">SGD</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="cancellationFee">Cancellation Fee</Label>
                <p className="text-sm text-muted-foreground">Charge cancellation fee</p>
              </div>
              <Switch id="cancellationFee" defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancellationFeePercentage">Cancellation Fee Percentage (%)</Label>
              <Input
                id="cancellationFeePercentage"
                type="number"
                step="0.01"
                defaultValue="50"
                placeholder="50"
              />
              <p className="text-xs text-muted-foreground">
                Percentage of booking amount charged for cancellations
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout Settings</CardTitle>
            <CardDescription>Configure payout settings for hosts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payoutSchedule">Payout Schedule</Label>
              <Select>
                <SelectTrigger id="payoutSchedule">
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payoutDelay">Payout Delay (days)</Label>
              <Input
                id="payoutDelay"
                type="number"
                defaultValue="3"
                placeholder="3"
              />
              <p className="text-xs text-muted-foreground">
                Number of days after check-in to process payout
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="payoutNotifications">Payout Notifications</Label>
                <p className="text-sm text-muted-foreground">Notify hosts of payouts</p>
              </div>
              <Switch id="payoutNotifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between pt-4">
          <div>
            {saveSuccess && (
              <p className="text-sm text-green-600">Settings saved successfully!</p>
            )}
          </div>
          <Button type="submit" disabled={saveSuccess}>
            {saveSuccess ? 'Saved' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
