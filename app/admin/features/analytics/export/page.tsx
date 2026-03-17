'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { Download, FileText, BarChart, PieChart, LineChart } from 'lucide-react';

// Mock data export options
const exportOptions = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' }
];

const dataSources = [
  { value: 'users', label: 'Users' },
  { value: 'listings', label: 'Listings' },
  { value: 'reservations', label: 'Reservations' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'financial', label: 'Financial Data' },
  { value: 'analytics', label: 'Analytics Data' }
];

const dateRanges = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'last90', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' }
];

export default function DataExport() {
  const [formData, setFormData] = useState({
    dataSource: 'users',
    exportFormat: 'csv',
    dateRange: 'last30',
    startDate: '',
    endDate: '',
    includeHeaders: true,
    compress: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Export data:', formData);
    // Show success message
    alert('Data export started!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Data Export</h1>
          <p className="text-gray-500 mt-1">Export your platform's data in various formats</p>
        </div>
        <Button onClick={handleSubmit} disabled={formData.dateRange === 'custom' && (!formData.startDate || !formData.endDate)}>
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Export Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataSource">Data Source</Label>
                <Select
                  value={formData.dataSource}
                  onValueChange={(value) => handleSelectChange('dataSource', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataSources.map(source => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exportFormat">Export Format</Label>
                <Select
                  value={formData.exportFormat}
                  onValueChange={(value) => handleSelectChange('exportFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select export format" />
                  </SelectTrigger>
                  <SelectContent>
                    {exportOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select
                value={formData.dateRange}
                onValueChange={(value) => handleSelectChange('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.dateRange === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  id="includeHeaders"
                  name="includeHeaders"
                  type="checkbox"
                  checked={formData.includeHeaders}
                  onChange={handleChange}
                  className="rounded"
                />
                <Label htmlFor="includeHeaders">Include headers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  id="compress"
                  name="compress"
                  type="checkbox"
                  checked={formData.compress}
                  onChange={handleChange}
                  className="rounded"
                />
                <Label htmlFor="compress">Compress file</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="w-5 h-5 mr-2" />
              Export Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-500">Data Source</div>
                <div className="font-medium">{dataSources.find(source => source.value === formData.dataSource)?.label}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-500">Export Format</div>
                <div className="font-medium">{exportOptions.find(option => option.value === formData.exportFormat)?.label}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-500">Date Range</div>
                <div className="font-medium">
                  {formData.dateRange === 'custom' ? (
                    `${formData.startDate} - ${formData.endDate}`
                  ) : (
                    dateRanges.find(range => range.value === formData.dateRange)?.label
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={formData.dateRange === 'custom' && (!formData.startDate || !formData.endDate)}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </form>
    </div>
  );
}
