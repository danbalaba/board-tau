'use client';

import React from 'react';
import { Modal } from '@/app/admin/components/ui/modal';
import { Button } from '@/app/admin/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import {
  IconTrendingUp,
  IconUsers,
  IconCalendar,
  IconCurrencyDollar,
  IconDownload
} from '@tabler/icons-react';

interface PerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PerformanceModal({ isOpen, onClose }: PerformanceModalProps) {
  return (
    <Modal
      title="Performance"
      description="Your hosting statistics"
      isOpen={isOpen}
      onClose={onClose}
      className="sm:max-w-md"
    >
      <div className="space-y-3">
        {/* Overview Cards - Very compact */}
        <div className="grid grid-cols-2 gap-2">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-1 text-xs font-medium">
                <IconTrendingUp className="w-3 h-3 text-green-500" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-md font-bold">$12.4k</p>
              <p className="text-xs text-green-500">+12.5%</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-1 text-xs font-medium">
                <IconUsers className="w-3 h-3 text-blue-500" />
                Guests
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-md font-bold">234</p>
              <p className="text-xs text-green-500">+8.3%</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-1 text-xs font-medium">
                <IconCalendar className="w-3 h-3 text-purple-500" />
                Occupancy
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-md font-bold">87%</p>
              <p className="text-xs text-green-500">+3.2%</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-1 text-xs font-medium">
                <IconCurrencyDollar className="w-3 h-3 text-orange-500" />
                Avg. Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-md font-bold">$156</p>
              <p className="text-xs text-red-500">-2.1%</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend Chart - Mini */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-xs">Chart</p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics - Tiny */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Booking Rate</p>
              <p className="text-sm font-semibold">92%</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cancellation</p>
              <p className="text-sm font-semibold">4.5%</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Response Time</p>
              <p className="text-sm font-semibold">2.3h</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions - Minimal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: Jan 2026
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs">
              <IconDownload className="w-3 h-3 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs">
              View Full
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
