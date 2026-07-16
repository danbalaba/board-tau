'use client';

import React, { useState } from 'react';
import { AdminDirectoryHeader } from './admin-directory-header';
import { DirectoryKPICards } from './directory-kpi-cards';
import { DirectoryListView, Property } from './directory-list-view';

// Hardcoded mock data (would normally come from API)
const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Luxury Sky Studio',
    location: 'Central Business District, Singapore',
    type: 'Studio',
    status: 'available',
    price: 3200,
    rating: 4.9,
    occupancy: 95,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400&h=250'
  },
  {
    id: '2',
    name: 'Garden View Suite',
    location: 'Tiong Bahru, Singapore',
    type: '1 Bedroom',
    status: 'occupied',
    price: 4500,
    rating: 4.7,
    occupancy: 100,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400&h=250'
  },
  {
    id: '3',
    name: 'Modern Loft',
    location: 'Holland Village, Singapore',
    type: '2 Bedrooms',
    status: 'maintenance',
    price: 5800,
    rating: 4.5,
    occupancy: 0,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=400&h=250'
  },
  {
    id: '4',
    name: 'Urban Penthouse',
    location: 'Marina Bay, Singapore',
    type: '3+ Bedrooms',
    status: 'available',
    price: 12000,
    rating: 5.0,
    occupancy: 88,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400&h=250'
  }
];

export function PropertyDirectory() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminDirectoryHeader view={view} setView={setView} />

      <DirectoryKPICards isLoading={false} />

      <DirectoryListView properties={mockProperties} viewMode={view} />
    </div>
  );
}
