'use client';

import React from 'react';

// The dashboard is rendered entirely by the OverViewPage component in page.tsx.
// This layout passes children (the page) through without adding its own UI.
export default function OverViewLayout({
  children,
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  children: React.ReactNode;
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  return <>{children}</>;
}
