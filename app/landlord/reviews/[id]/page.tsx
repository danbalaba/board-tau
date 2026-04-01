import React from 'react';
import LandlordReviewDetailFeature from '../../features/reviews/landlord-review-detail-feature';

export default async function ReviewDetailsPage({ params }: { params: any }) {
  const { id } = await params;

  return <LandlordReviewDetailFeature id={id} />;
}
