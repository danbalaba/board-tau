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
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Switch } from '@/app/admin/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/admin/components/ui/avatar';

// Sample data
const listings = [
  {
    id: 1,
    title: 'Cozy Studio Apartment in CBD',
    location: 'Central Business District, Singapore',
    price: 1200,
    rooms: 1,
    bathrooms: 1,
    description: 'A beautifully furnished studio apartment located in the heart of Singapore\'s CBD. Perfect for young professionals looking for convenient living.',
    images: ['https://picsum.photos/200/150?random=1', 'https://picsum.photos/200/150?random=2'],
    status: 'pending',
    host: {
      name: 'Jane Doe',
      avatar: 'https://picsum.photos/200/150?random=avatar1',
      email: 'jane.doe@example.com'
    },
    submittedAt: '2024-01-15T09:30:00'
  },
  {
    id: 2,
    title: 'Spacious 2-Bedroom in Tiong Bahru',
    location: 'Tiong Bahru, Singapore',
    price: 2800,
    rooms: 2,
    bathrooms: 2,
    description: 'A spacious 2-bedroom apartment with modern amenities in the trendy Tiong Bahru area. Close to cafes, shops, and public transport.',
    images: ['https://picsum.photos/200/150?random=3', 'https://picsum.photos/200/150?random=4', 'https://picsum.photos/200/150?random=5'],
    status: 'approved',
    host: {
      name: 'John Smith',
      avatar: 'https://picsum.photos/200/150?random=avatar2',
      email: 'john.smith@example.com'
    },
    submittedAt: '2024-01-14T14:45:00'
  },
  {
    id: 3,
    title: 'Modern Condo in Sentosa Cove',
    location: 'Sentosa Cove, Singapore',
    price: 4500,
    rooms: 3,
    bathrooms: 3,
    description: 'Luxury living at its finest in Sentosa Cove. This modern condo offers stunning sea views and access to premium amenities.',
    images: ['https://picsum.photos/200/150?random=6', 'https://picsum.photos/200/150?random=7', 'https://picsum.photos/200/150?random=8', 'https://picsum.photos/200/150?random=9'],
    status: 'rejected',
    host: {
      name: 'Michael Johnson',
      avatar: 'https://picsum.photos/200/150?random=avatar3',
      email: 'michael.johnson@example.com'
    },
    submittedAt: '2024-01-13T11:20:00'
  }
];

export function ListingsReview() {
  const [selectedListing, setSelectedListing] = useState(listings[0]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [decision, setDecision] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleReview = () => {
    setIsReviewing(false);
    // Here you would typically send the review to an API
    console.log(`Review for listing ${selectedListing.id}: ${decision}`, notes);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Listings Review</h2>
          <p className="text-muted-foreground">Review and approve property listings</p>
        </div>
        <Button>
          <span className="mr-2">📊</span>
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listings List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Listings Queue</CardTitle>
              <CardDescription>Pending listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedListing.id === listing.id ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedListing(listing);
                      setIsReviewing(false);
                      setDecision('');
                      setNotes('');
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{listing.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        listing.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{listing.location}</p>
                      <p className="font-medium mt-1">${listing.price}/mo</p>
                      <p className="text-xs mt-1">{listing.rooms} beds, {listing.bathrooms} baths</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={listing.host.avatar} />
                          <AvatarFallback>{listing.host.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {listing.host.name}
                      </div>
                      <p>{new Date(listing.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listing Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{selectedListing.title}</CardTitle>
              <CardDescription>Listing Review</CardDescription>
            </CardHeader>
            <CardContent>
              {!isReviewing ? (
                <div className="space-y-6">
                  {/* Host Information */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedListing.host.avatar} />
                      <AvatarFallback>{selectedListing.host.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-medium">{selectedListing.host.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedListing.host.email}</p>
                    </div>
                  </div>

                  {/* Listing Images */}
                  <div>
                    <h3 className="font-medium mb-3">Images</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedListing.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Listing image ${index + 1}`}
                          className="rounded-lg w-full h-32 object-cover"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Listing Description */}
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedListing.description}</p>
                  </div>

                  {/* Listing Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Price</h3>
                      <p>${selectedListing.price}/month</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Location</h3>
                      <p>{selectedListing.location}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Rooms</h3>
                      <p>{selectedListing.rooms} bedroom{selectedListing.rooms > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Bathrooms</h3>
                      <p>{selectedListing.bathrooms} bathroom{selectedListing.bathrooms > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <Button onClick={() => setIsReviewing(true)}>
                    <span className="mr-2">✏️</span>
                    Start Review
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="decision">Review Decision</Label>
                      <Select value={decision} onValueChange={setDecision}>
                        <SelectTrigger id="decision">
                          <SelectValue placeholder="Select decision" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approve">Approve</SelectItem>
                          <SelectItem value="reject">Reject</SelectItem>
                          <SelectItem value="request-modification">Request Modification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Review Notes</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about the listing..."
                        className="min-h-[150px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Review Priority</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button variant="outline" onClick={() => setIsReviewing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleReview} disabled={!decision.trim()}>
                      <span className="mr-2">✅</span>
                      Complete Review
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
