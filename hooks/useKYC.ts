import { useState } from 'react';
import { faceEngine } from '@/lib/mediapipe/face-engine';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

export type KYCStep = 'SELFIE' | 'ID';

export const useKYC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const responsiveToast = useResponsiveToast();

  /**
   * Validates a Selfie capture
   */
  const validateSelfie = async (imageSrc: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => (img.onload = resolve));

      const result = await faceEngine.validateFace(img);
      
      if (!result.isValid) {
        responsiveToast.error(result.reason || "Selfie verification failed");
        return false;
      }

      responsiveToast.success("Face verified successfully!");
      return true;
    } catch (error) {
      console.error("KYC Error:", error);
      responsiveToast.error("Error during face verification");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isInitializing,
    isProcessing: isProcessing || isInitializing,
    validateSelfie,
    faceEngine
  };
};
