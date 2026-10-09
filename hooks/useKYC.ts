import { useState } from 'react';

export type KYCStep = 'SELFIE' | 'ID';

/**
 * Lightweight KYC Hook
 * All biometric verification, OCR, document AI, and face matching are performed
 * server-side via AWS Rekognition Multi-Model AI (/api/kyc/verify).
 */
export const useKYC = () => {
  const [isInitializing, _setIsInitializing] = useState(false);
  const [isProcessing, _setIsProcessing] = useState(false);

  return {
    isInitializing,
    isProcessing: isProcessing || isInitializing,
  };
};
