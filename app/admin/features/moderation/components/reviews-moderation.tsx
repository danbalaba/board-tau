'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/app/admin/components/ui/table';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

interface Review {
  id: string;
  listing: string;
  user: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  lastUpdated: string;
}

const reviews: Review[] = [
  {
    id: '1',
    listing: 'Cozy Studio in Downtown',
    user: 'Jane Smith',
    rating: 5,
    comment: 'Great experience! The studio was clean and well-equipped.',
    status: 'pending',
    submittedAt: '2024-01-10T08:15:00Z',
    lastUpdated: '2024-01-10T08:15:00Z'
  },
  {
    id: '2',
    listing: 'Beach Villa',
    user: 'Mike Johnson',
    rating: 4,
    comment: 'Beautiful location but a bit noisy at night.',
    status: 'pending',
    submittedAt: '2024-01-09T14:20:00Z',
    lastUpdated: '2024-01-09T14:20:00Z'
  },
  {
    id: '3',
    listing: 'Luxury Apartment',
    user: 'Tom Brown',
    rating: 1,
    comment: 'Terrible experience! The apartment was dirty and smelly.',
    status: 'pending',
    submittedAt: '2024-01-08T11:30:00Z',
    lastUpdated: '2024-01-08T11:30:00Z'
  },
  {
    id: '4',
    listing: 'City Center Apartment',
    user: 'Sarah Williams',
    rating: 3,
    comment: 'Average experience. The location was great but the apartment was small.',
    status: 'pending',
    submittedAt: '2024-01-07T09:15:00Z',
    lastUpdated: '2024-01-07T09:15:00Z'
  }
];

const statusColors = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive'
};

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected'
};

const renderStars = (rating: number) => {
  return (
    <div className="flex space-x-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-sm ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export function ReviewsModeration() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reviews & Ratings</h2>
          <p className="text-muted-foreground">Review and moderate user reviews and ratings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reviews & Ratings</CardTitle>
          <CardDescription>
            {reviews.filter(review => review.status === 'pending').length} reviews pending review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.listing}</TableCell>
                  <TableCell>{review.user}</TableCell>
                  <TableCell>{renderStars(review.rating)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {review.comment}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[review.status] as any}>
                      {statusLabels[review.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(review.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('View', review.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {review.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => console.log('Approve', review.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => console.log('Reject', review.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Reviews</CardTitle>
            <CardDescription>All user reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reviews.length}</div>
            <p className="text-sm text-muted-foreground">Total reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Review</CardTitle>
            <CardDescription>Reviews awaiting moderation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {reviews.filter(review => review.status === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Rating</CardTitle>
            <CardDescription>Overall average rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
