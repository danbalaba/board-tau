'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface Review {
  id: string;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  rating: number;
  comment: string | null;
  images: string[];
  videos?: string[];
  response: string | null;
  status: string;
  createdAt: Date | string;
  respondedAt: Date | string | null;
}

export function useReviewDetailLogic(reviewId: string) {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviewDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/landlord/reviews?id=${reviewId}`);
        if (!res.ok) throw new Error('Failed to fetch review details');
        const data = await res.json();
        setReview(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (reviewId) fetchReviewDetails();
  }, [reviewId]);

  const handleSubmitResponse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!responseText.trim()) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Submitting response...');

    try {
      const res = await fetch(`/api/landlord/reviews?id=${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: responseText.trim() }),
      });

      if (!res.ok) throw new Error('Failed to submit response');

      const data = await res.json();
      setReview(data.data);
      setResponseText('');
      toast.success('Response submitted successfully!', { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    review,
    loading,
    error,
    responseText,
    setResponseText,
    isSubmitting,
    handleSubmitResponse
  };
}
