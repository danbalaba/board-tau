'use client';

import React, { createContext, useContext, useState } from 'react';

export interface KerbyGuidanceState {
  pose?: 'waving' | 'pointing' | 'thinking' | 'loving' | 'studying' | 'driving' | 'sleeping' | 'excited';
  speech?: string;
  badge?: string;
}

interface KerbyContextType {
  kerbyState: KerbyGuidanceState | null;
  setKerbyState: (state: KerbyGuidanceState | null) => void;
}

const KerbyContext = createContext<KerbyContextType>({
  kerbyState: null,
  setKerbyState: () => {},
});

export const KerbyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kerbyState, setKerbyState] = useState<KerbyGuidanceState | null>(null);

  return (
    <KerbyContext.Provider value={{ kerbyState, setKerbyState }}>
      {children}
    </KerbyContext.Provider>
  );
};

export const useKerby = () => useContext(KerbyContext);
