'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Switch } from '@/app/admin/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Save, Flag, Eye, EyeOff, Trash } from 'lucide-react';

// Mock feature flags data
const initialFeatures = [
  {
    id: '1',
    name: 'Dark Mode',
    description: 'Allow users to switch to dark mode',
    enabled: true,
    environment: 'production',
    createdAt: '2023-01-15',
    updatedAt: '2024-01-10'
  },
  {
    id: '2',
    name: 'Multi-language Support',
    description: 'Allow users to switch between languages',
    enabled: false,
    environment: 'staging',
    createdAt: '2023-03-20',
    updatedAt: '2024-01-09'
  },
  {
    id: '3',
    name: 'Advanced Search',
    description: 'Enhanced search functionality with filters',
    enabled: true,
    environment: 'production',
    createdAt: '2023-05-10',
    updatedAt: '2024-01-08'
  },
  {
    id: '4',
    name: 'Chat Feature',
    description: 'Allow users to chat with hosts',
    enabled: false,
    environment: 'development',
    createdAt: '2023-07-05',
    updatedAt: '2023-11-15'
  }
];

export default function FeatureFlags() {
  const [features, setFeatures] = useState(initialFeatures);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeature, setNewFeature] = useState({
    name: '',
    description: '',
    enabled: false,
    environment: 'production'
  });

  const handleToggleFeature = (id: string) => {
    setFeatures(prev => prev.map(feature =>
      feature.id === id ? { ...feature, enabled: !feature.enabled } : feature
    ));
  };

  const handleNewFeatureChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setNewFeature(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    const feature = {
      id: Date.now().toString(),
      ...newFeature,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setFeatures(prev => [...prev, feature]);
    setNewFeature({
      name: '',
      description: '',
      enabled: false,
      environment: 'production'
    });
    setShowAddForm(false);
  };

  const handleDeleteFeature = (id: string) => {
    setFeatures(prev => prev.filter(feature => feature.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Feature Flags</h1>
          <p className="text-gray-500 mt-1">Manage your platform's feature flags</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Flag className="w-4 h-4 mr-2" />
          Add Feature Flag
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {features.map(feature => (
          <Card key={feature.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                {feature.name}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleFeature(feature.id)}
                >
                  {feature.enabled ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFeature(feature.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="text-sm text-gray-500">{feature.description}</p>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Status</Label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    feature.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {feature.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Environment</Label>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {feature.environment}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Created: {feature.createdAt} | Updated: {feature.updatedAt}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flag className="w-5 h-5 mr-2" />
              Add New Feature Flag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFeature} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Feature Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newFeature.name}
                    onChange={handleNewFeatureChange}
                    placeholder="Enter feature name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <Select
                    value={newFeature.environment}
                    onValueChange={(value) => setNewFeature(prev => ({ ...prev, environment: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newFeature.description}
                  onChange={handleNewFeatureChange}
                  placeholder="Enter feature description"
                  rows={3}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  name="enabled"
                  checked={newFeature.enabled}
                  onCheckedChange={(checked) => setNewFeature(prev => ({ ...prev, enabled: checked }))}
                />
                <Label htmlFor="enabled">Enable feature flag</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Save Feature Flag
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
