import { useState, useCallback, useRef } from 'react';
import { faceEngine } from '@/lib/mediapipe/face-engine';
import { idEngine } from '@/lib/mediapipe/id-engine';
import toast from 'react-hot-toast';

export type KYCStep = 'SELFIE' | 'ID';

export const useKYC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
        toast.error(result.reason || "Selfie verification failed");
        return false;
      }

      toast.success("Face verified successfully!");
      return true;
    } catch (error) {
      console.error("KYC Error:", error);
      toast.error("Error during face verification");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Validates an ID capture
   */
  const validateID = async (imageSrc: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => (img.onload = resolve));

      // 1. Detect ID Card Presence
      const idResult = await idEngine.validateIDCard(img);
      if (!idResult.isValid) {
        toast.error(idResult.reason || "ID card not detected");
        return false;
      }

      // 2. OCR Check (Optional: You can still use Tesseract here, but now 
      // we know there is actually a card in the frame)
      
      toast.success("ID card detected!");
      return true;
    } catch (error) {
      console.error("KYC Error:", error);
      toast.error("Error during ID verification");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isInitializing,
    setIsInitializing,
    isProcessing,
    validateSelfie,
    validateID,
    faceEngine,
    idEngine
  };
};
