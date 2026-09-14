'use client';

import React from 'react';
import { LandlordPropertyCreator } from './landlord-property-creator';

interface LandlordPropertyEditorProps {
  initialData?: any;
}

export default function LandlordPropertyEditor({ initialData = {} }: LandlordPropertyEditorProps) {
  return <LandlordPropertyCreator initialData={initialData} />;
}
