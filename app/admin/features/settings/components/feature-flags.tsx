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
import { Textarea } from '@/app/admin/components/ui/textarea';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: string;
  lastModified: string;
}

const initialFeatures: FeatureFlag[] = [
  {
    id: '1',
    name: 'Multi-language Support',
    description: 'Allow users to switch between multiple languages',
    enabled: true,
    createdAt: '2024-01-01T10:00:00Z',
    lastModified: '2024-01-10T09:30:00Z'
  },
  {
    id: '2',
    name: 'Dark Mode',
    description: 'Enable dark mode for the platform',
    enabled: true,
    createdAt: '2024-01-05T14:20:00Z',
    lastModified: '2024-01-08T11:45:00Z'
  },
  {
    id: '3',
    name: 'Advanced Search',
    description: 'Allow users to search with advanced filters',
    enabled: true,
    createdAt: '2024-01-03T09:15:00Z',
    lastModified: '2024-01-07T16:20:00Z'
  },
  {
    id: '4',
    name: 'Chat Support',
    description: 'Enable real-time chat support',
    enabled: false,
    createdAt: '2024-01-06T11:30:00Z',
    lastModified: '2024-01-06T11:30:00Z'
  },
  {
    id: '5',
    name: 'Booking Insurance',
    description: 'Offer optional booking insurance to users',
    enabled: false,
    createdAt: '2024-01-08T13:45:00Z',
    lastModified: '2024-01-08T13:45:00Z'
  }
];

export function FeatureFlags() {
  const [features, setFeatures] = useState<FeatureFlag[]>(initialFeatures);
  const [newFeature, setNewFeature] = useState({
    name: '',
    description: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleToggle = (id: string) => {
    setFeatures(features.map(feature =>
      feature.id === id ? { ...feature, enabled: !feature.enabled } : feature
    ));
  };

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    const newFeatureItem: FeatureFlag = {
      id: Date.now().toString(),
      name: newFeature.name,
      description: newFeature.description,
      enabled: false,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    setFeatures([...features, newFeatureItem]);
    setNewFeature({ name: '', description: '' });
    setShowAddForm(false);
  };

  const handleDeleteFeature = (id: string) => {
    setFeatures(features.filter(feature => feature.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Feature Flags</h2>
          <p className="text-muted-foreground">Manage platform features using flags</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add Feature'}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Feature</CardTitle>
            <CardDescription>Create a new feature flag</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFeature} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="featureName">Feature Name</Label>
                <Input
                  id="featureName"
                  placeholder="Feature name"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featureDescription">Description</Label>
                <Textarea
                  id="featureDescription"
                  placeholder="Description of what this feature does"
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  rows={2}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewFeature({ name: '', description: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Feature</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {features.map((feature) => (
          <Card key={feature.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    {feature.name}
                    {feature.enabled && (
                      <span className="text-xs font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Switch
                      id={`feature-${feature.id}`}
                      checked={feature.enabled}
                      onCheckedChange={() => handleToggle(feature.id)}
                    />
                    <Label htmlFor={`feature-${feature.id}`}>
                      {feature.enabled ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFeature(feature.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  Created: {new Date(feature.createdAt).toLocaleDateString()}
                </div>
                <div>
                  Last modified: {new Date(feature.lastModified).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
