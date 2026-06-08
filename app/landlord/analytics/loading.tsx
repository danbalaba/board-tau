'use client';

import React, { useEffect } from 'react';
import { useLoading } from "@/components/loading/LoadingContext";
import LandlordAnalytics from '../features/analytics';

export default function AnalyticsLoading() {
  const { startLoading } = useLoading();

  useEffect(() => {
    startLoading();
  }, [startLoading]);

  return <LandlordAnalytics isLoading={true} />;
}
