'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { Save, Grid, Plus, Edit, Trash } from 'lucide-react';

// Mock dashboards data
const initialDashboards = [
  {
    id: '1',
    name: 'Executive Overview',
    description: 'High-level overview of platform performance',
    widgets: [
      { type: 'kpi', title: 'Total Users', value: '1,450' },
      { type: 'kpi', title: 'New Users', value: '600' },
      { type: 'chart', title: 'User Growth', chartType: 'bar' },
      { type: 'chart', title: 'Revenue', chartType: 'line' }
    ],
    createdAt: '2023-01-15',
    updatedAt: '2024-01-10'
  },
  {
    id: '2',
    name: 'User Analytics',
    description: 'Detailed user behavior and engagement metrics',
    widgets: [
      { type: 'kpi', title: 'Active Users', value: '950' },
      { type: 'kpi', title: 'User Retention', value: '78%' },
      { type: 'chart', title: 'User Location', chartType: 'bar' },
      { type: 'chart', title: 'User Types', chartType: 'pie' }
    ],
    createdAt: '2023-03-20',
    updatedAt: '2024-01-09'
  },
  {
    id: '3',
    name: 'Financial Dashboard',
    description: 'Revenue, transactions, and financial metrics',
    widgets: [
      { type: 'kpi', title: 'Total Revenue', value: '$125,000' },
      { type: 'kpi', title: 'Monthly Revenue', value: '$25,000' },
      { type: 'chart', title: 'Revenue Trend', chartType: 'line' },
      { type: 'chart', title: 'Revenue by Source', chartType: 'pie' }
    ],
    createdAt: '2023-05-10',
    updatedAt: '2024-01-08'
  }
];

export default function CustomDashboards() {
  const [dashboards, setDashboards] = useState(initialDashboards);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: '',
    widgets: []
  });

  const handleNewDashboardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDashboard(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    const dashboard = {
      id: Date.now().toString(),
      ...newDashboard,
      widgets: [
        { type: 'kpi', title: 'Total Users', value: '1,450' },
        { type: 'chart', title: 'User Growth', chartType: 'bar' }
      ],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setDashboards(prev => [...prev, dashboard]);
    setNewDashboard({
      name: '',
      description: '',
      widgets: []
    });
    setShowAddForm(false);
  };

  const handleDeleteDashboard = (id: string) => {
    setDashboards(prev => prev.filter(dashboard => dashboard.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Custom Dashboards</h1>
          <p className="text-gray-500 mt-1">Create and manage custom dashboards</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dashboards.map(dashboard => (
          <Card key={dashboard.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                {dashboard.name}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDashboard(dashboard.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="text-sm text-gray-500">{dashboard.description}</p>
              <div className="grid grid-cols-2 gap-4">
                {dashboard.widgets.map((widget, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500">{widget.title}</div>
                    {widget.type === 'kpi' ? (
                      <div className="text-xl font-bold">{widget.value}</div>
                    ) : (
                      <div className="h-16 bg-gray-200 rounded"></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500">
                Created: {dashboard.createdAt} | Updated: {dashboard.updatedAt}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Grid className="w-5 h-5 mr-2" />
              Create New Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDashboard} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Dashboard Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newDashboard.name}
                  onChange={handleNewDashboardChange}
                  placeholder="Enter dashboard name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newDashboard.description}
                  onChange={handleNewDashboardChange}
                  placeholder="Enter dashboard description"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Create Dashboard
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
