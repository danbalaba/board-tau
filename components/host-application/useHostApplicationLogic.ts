"use client";
// Force cache invalidation

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { useEdgeStore } from '@/lib/edgestore';
import { useKYC } from '@/hooks/useKYC';
import { createHostApplication } from '@/services/landlord/applications';
import { base64ToFile } from './HostApplicationUtils';
import { TAU_COORDINATES } from '@/utils/constants';

export interface HostApplicationFormData {
  businessInfo: {
    businessName: string;
    businessType: string;
    businessDescription: string;
    yearsExperience: string;
  };
  contactInfo: {
    fullName: string;
    phoneNumber: string;
    email: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phoneNumber: string;
    };
  };
  propertyEvidence: {
    address: string;
    facadePhotoUrl: string;
    latlng: [number, number];
  };
  verification: {
    selfieUrl: string;
    idCardUrl: string;
    businessPermitUrl: string;
    fireSafetyUrl: string;
  };
}

export const useHostApplicationLogic = (onClose?: () => void) => {
  const router = useRouter();
  const { edgestore } = useEdgeStore();
  const toast = useResponsiveToast();
  const { isProcessing, faceEngine, idEngine } = useKYC();
  
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStep, setIsLoadingStep] = useState(false);
  const [direction, setDirection] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Biometric / File States
  const webcamRef = useRef<Webcam>(null);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [capturedID, setCapturedID] = useState<string | null>(null);
  const [hasUserBlinked, setHasUserBlinked] = useState(false);
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const [isIDAligned, setIsIDAligned] = useState(false);
  const [isPhoneDetected, setIsPhoneDetected] = useState(false);
  const [hasReadGuidelines, setHasReadGuidelines] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isFlashActive, setIsFlashActive] = useState(false);
  
  const [facadeFile, setFacadeFile] = useState<File | null>(null);
  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [fireSafetyFile, setFireSafetyFile] = useState<File | null>(null);

  const { register, handleSubmit, control, watch, formState: { errors }, setValue, trigger } = useForm<HostApplicationFormData>({
    defaultValues: {
      businessInfo: { businessName: '', businessType: '', businessDescription: '', yearsExperience: 'less-than-1' },
      contactInfo: { fullName: '', phoneNumber: '', email: '', emergencyContact: { name: '', relationship: '', phoneNumber: '' } },
      propertyEvidence: { address: '', facadePhotoUrl: '', latlng: TAU_COORDINATES },
      verification: { selfieUrl: '', idCardUrl: '', businessPermitUrl: '', fireSafetyUrl: '' }
    }
  });

  // Optimized Biometric Loops for Low-Spec Hardware
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const isSelfieStep = step === 5;
    
    if (isSelfieStep && !capturedSelfie && !isProcessing) {
      interval = setInterval(async () => {
        const video = webcamRef.current?.video;
        // Only run heavy AI if video is actually streaming
        if (video && video.readyState === 4 && video.videoWidth > 0) {
          try {
            const result = await faceEngine.validateFace(video);
            setIsFaceAligned(result.isValid);
            
            const scores = await faceEngine.getBlinkScores(video);
            if (scores && (scores.left > 0.6 || scores.right > 0.6)) {
              setHasUserBlinked(true);
            }
          } catch (e) {
            console.error("Selfie engine error:", e);
          }
        }
      }, 400); // Throttled to 400ms for performance
    }
    return () => clearInterval(interval);
  }, [step, capturedSelfie, isProcessing, faceEngine]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const isIDStep = step === 6;

    if (isIDStep && !capturedID && !isProcessing) {
      interval = setInterval(async () => {
        const video = webcamRef.current?.video;
        // Only run heavy AI if video is actually streaming
        if (video && video.readyState === 4 && video.videoWidth > 0) {
          try {
            const result = await idEngine.validateIDCard(video);
            setIsIDAligned(result.isValid);
            setIsPhoneDetected(result.reason?.toLowerCase().includes("screen") || false);
          } catch (e) {
            console.error("ID engine error:", e);
          }
        }
      }, 400); // Throttled to 400ms for performance
    }
    return () => clearInterval(interval);
  }, [step, capturedID, isProcessing, idEngine]);

  // Handlers
  const handleCaptureSelfie = async () => {
    if (!hasUserBlinked) {
      toast.error("Please blink naturally to prove you are real.");
      return;
    }
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 150);
    const image = webcamRef.current?.getScreenshot();
    if (image) {
      setCapturedSelfie(image);
      toast.success("Selfie captured!");
    }
  };

  const handleCaptureID = async () => {
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 150);
    const image = webcamRef.current?.getScreenshot();
    if (image) {
      setCapturedID(image);
      toast.success("ID Document captured!");
    }
  };

  const nextStep = async () => {
    let isValid = true;
    if (step === 1) isValid = await trigger(['businessInfo', 'contactInfo']);
    if (step === 2) isValid = !!facadeFile && await trigger(['propertyEvidence.address']);
    if (step === 3) isValid = !!permitFile && !!fireSafetyFile;
    if (step === 4) isValid = hasReadGuidelines;
    if (step === 5) isValid = !!capturedSelfie;
    if (step === 6) isValid = !!capturedID;

    if (isValid) {
      setIsLoadingStep(true);
      setDirection(1);
      setTimeout(() => {
        setStep(prev => prev + 1);
        setIsLoadingStep(false);
      }, 600);
    } else {
      toast.error("Complete the current step to continue.");
    }
  };

  const prevStep = () => {
    setIsLoadingStep(true);
    setDirection(-1);
    setTimeout(() => {
      setStep(prev => Math.max(0, prev - 1));
      setIsLoadingStep(false);
    }, 600);
  };

  const onSubmitForm = async (data: HostApplicationFormData) => {
    setIsSubmitting(true);
    try {
      toast.loading("Uploading secure verification documents...", { id: 'host-sub' });

      // Secure Private Uploads (IDs and Permits)
      const selfieUrl = (await edgestore.identityDocs.upload({ 
        file: base64ToFile(capturedSelfie!, "selfie.jpg"), 
        input: { listingId: "PENDING", landlordId: "PENDING" } 
      })).url;
      const idUrl = (await edgestore.identityDocs.upload({ 
        file: base64ToFile(capturedID!, "id_card.jpg"), 
        input: { listingId: "PENDING", landlordId: "PENDING" } 
      })).url;
      const permitUrl = (await edgestore.identityDocs.upload({ 
        file: permitFile!, 
        input: { listingId: "PENDING", landlordId: "PENDING" } 
      })).url;
      const fireUrl = (await edgestore.identityDocs.upload({ 
        file: fireSafetyFile!, 
        input: { listingId: "PENDING", landlordId: "PENDING" } 
      })).url;
      
      // Public Upload (Property Facade)
      const facadeUrl = (await edgestore.publicFiles.upload({ file: facadeFile! })).url;

      await createHostApplication({
        businessInfo: data.businessInfo,
        contactInfo: data.contactInfo,
        selfieUrl,
        idCardUrl: idUrl,
        businessPermitUrl: permitUrl,
        fireSafetyUrl: fireUrl,
        facadePhotoUrl: facadeUrl,
        additionalDocsUrl: ""
      } as any);

      toast.success("Application submitted successfully!", { id: 'host-sub' });
      setSubmitted(true);
      setTimeout(() => {
        onClose?.();
        router.push('/landlord/dashboard');
      }, 2500);
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please check your uploads.", { id: 'host-sub' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step, setStep,
    direction, setDirection,
    isSubmitting,
    isLoadingStep,
    webcamRef,
    capturedSelfie, setCapturedSelfie,
    capturedID, setCapturedID,
    hasUserBlinked,
    isFaceAligned, setIsFaceAligned, 
    isIDAligned, setIsIDAligned,
    isPhoneDetected,
    hasReadGuidelines, setHasReadGuidelines,
    facingMode, setFacingMode,
    isFlashActive,
    facadeFile, setFacadeFile,
    permitFile, setPermitFile,
    fireSafetyFile, setFireSafetyFile,
    register, handleSubmit: handleSubmit(onSubmitForm),
    control, watch, errors, setValue, trigger,
    nextStep, prevStep,
    handleCaptureSelfie, handleCaptureID,
    isProcessing,
    submitted
  };
};
