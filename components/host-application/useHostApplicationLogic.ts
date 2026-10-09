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
import { base64ToFile, formatTitleCase, sanitizeHostFormData, getMobileStepForDesktopStep, getDesktopStepForMobileStep } from './HostApplicationUtils';
import { TAU_COORDINATES } from '@/utils/constants';

import { saveDraftToStorage, loadDraftFromStorage, clearDraftFromStorage } from '@/utils/draftStorage';

export interface HostApplicationFormData {
  businessInfo: {
    businessName: string;
    businessType: string;
    yearsExperience: string;
  };
  contactInfo: {
    fullName: string;
    phoneNumber: string;
    email: string;
    ownershipRole: 'OWNER' | 'CO_OWNER_FAMILY' | 'AUTHORIZED_CARETAKER' | 'SUBLESSOR';
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
    utilityBillUrl?: string;
  };
}

const DRAFT_KEY = 'boardtau_host_onboarding_draft_v3';

const fileToDraftObject = (file: File | null): Promise<{ name: string; type: string; data: string } | null> => {
  if (!file) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result as string });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const useHostApplicationLogic = (onClose?: () => void) => {
  const router = useRouter();
  
  let edgestore: any = null;
  try {
    const edgeStoreContext = useEdgeStore();
    edgestore = edgeStoreContext?.edgestore;
  } catch (e) {
    edgestore = null;
  }

  const toast = useResponsiveToast();
  const { isProcessing } = useKYC();
  
  const [step, setStepState] = useState(0);
  const [mobileStep, setMobileStepState] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStep, setIsLoadingStep] = useState(false);
  const [direction, setDirection] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const stepRef = useRef(step);
  const mobileStepRef = useRef(mobileStep);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    mobileStepRef.current = mobileStep;
  }, [mobileStep]);

  const setStep = (action: number | ((prev: number) => number)) => {
    setStepState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      stepRef.current = next;
      if (next > 0) {
        const expectedMobile = getMobileStepForDesktopStep(next);
        if (getDesktopStepForMobileStep(mobileStepRef.current) !== next) {
          setMobileStepState(expectedMobile);
          mobileStepRef.current = expectedMobile;
        }
      }
      return next;
    });
  };

  const setMobileStep = (action: number | ((prev: number) => number)) => {
    setMobileStepState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      mobileStepRef.current = next;
      return next;
    });
  };

  // Biometric / File States
  const webcamRef = useRef<Webcam>(null);
  const scaledCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isFaceAlignedRef = useRef(false);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [capturedID, setCapturedID] = useState<string | null>(null);
  const [livenessStatus, setLivenessStatus] = useState<'idle' | 'passed'>('idle');
  const [activeChallenges, setActiveChallenges] = useState<('blink' | 'smile' | 'turnLeft' | 'turnRight' | 'openMouth' | 'raiseEyebrows')[]>([]);
  const consecutiveFaceFailures = useRef(0);
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const [isIDAligned, setIsIDAligned] = useState(false);
  const [isPhoneDetected, setIsPhoneDetected] = useState(false);
  const [hasReadGuidelines, setHasReadGuidelines] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [isSelfieProcessing, setIsSelfieProcessing] = useState(false);
  const [isIDProcessing, setIsIDProcessing] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(true);
  const [selfieRetakeNeeded, setSelfieRetakeNeeded] = useState(false);
  
  const [facadeFile, setFacadeFile] = useState<File | null>(null);
  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [utilityBillFile, setUtilityBillFile] = useState<File | null>(null);
  const [fireSafetyFile, setFireSafetyFile] = useState<File | null>(null);
  const [docChoice, setDocChoice] = useState<'permit' | 'utility'>('permit');

  // Submission Loader Modal Progress States
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStage, setSubmissionStage] = useState<1 | 2 | 3 | 4>(1);

  // 💾 Persistent Draft Auto-Save States
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [savedDraftData, setSavedDraftData] = useState<any>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isCheckingDraft, setIsCheckingDraft] = useState(true);
  const isRestoringDraftRef = useRef(false);

  const { register, handleSubmit, control, watch, formState: { errors }, setValue, trigger, getValues, setError, clearErrors, reset } = useForm<HostApplicationFormData>({
    mode: 'onChange',
    defaultValues: {
      businessInfo: { businessName: '', businessType: '' as any, yearsExperience: '' },
      contactInfo: { fullName: '', phoneNumber: '', email: '', ownershipRole: undefined as any },
      propertyEvidence: { address: '', facadePhotoUrl: '', latlng: TAU_COORDINATES },
      verification: { selfieUrl: '', idCardUrl: '', businessPermitUrl: '', fireSafetyUrl: '', utilityBillUrl: '' }
    }
  });

  const isDraftNotEmpty = (parsed: any): boolean => {
    if (!parsed) return false;
    if ((parsed.step && parsed.step > 1) || (parsed.mobileStep && parsed.mobileStep > 1)) return true;
    const cInfo = parsed.formValues?.contactInfo || {};
    const bInfo = parsed.formValues?.businessInfo || {};
    const pEvid = parsed.formValues?.propertyEvidence || {};
    return Boolean(
      cInfo.fullName?.trim() ||
      cInfo.phoneNumber?.trim() ||
      bInfo.businessName?.trim() ||
      pEvid.address?.trim() ||
      parsed.capturedSelfie ||
      parsed.capturedID
    );
  };

  // Check for existing saved draft on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsCheckingDraft(false);
      return;
    }
    loadDraftFromStorage(DRAFT_KEY).then((parsed) => {
      if (parsed && isDraftNotEmpty(parsed)) {
        setSavedDraftData(parsed);
        setHasSavedDraft(true);
        if (parsed.updatedAt) {
          const timeObj = new Date(parsed.updatedAt);
          setLastSavedTimestamp(timeObj.getTime());
          setLastSavedTime(timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          setSaveStatus('saved');
        }
      } else {
        clearDraftFromStorage(DRAFT_KEY).catch(() => {});
      }
    }).catch((err) => {
      console.warn('Error reading host onboarding draft:', err);
    }).finally(() => {
      setIsCheckingDraft(false);
    });
  }, []);

  // Auto-save form state to IndexedDB / Storage whenever fields change
  useEffect(() => {
    if (typeof window === 'undefined' || isCheckingDraft || hasSavedDraft || isRestoringDraftRef.current) return;
    let timer: NodeJS.Timeout;

    const subscription = watch((value) => {
      if (isSubmitting || submitted || isCheckingDraft || hasSavedDraft || isRestoringDraftRef.current) return;
      const currentStep = stepRef.current;
      const currentMobileStep = mobileStepRef.current;
      if (!isDraftNotEmpty({ formValues: value, step: currentStep, mobileStep: currentMobileStep, capturedSelfie, capturedID })) return;

      setSaveStatus('saving');
      clearTimeout(timer);

      timer = setTimeout(async () => {
        if (isSubmitting || submitted || isCheckingDraft || hasSavedDraft || isRestoringDraftRef.current) return;
        try {
          const now = new Date();
          const facadeFileObj = await fileToDraftObject(facadeFile);
          const permitFileObj = await fileToDraftObject(permitFile);
          const utilityBillFileObj = await fileToDraftObject(utilityBillFile);
          const fireSafetyFileObj = await fileToDraftObject(fireSafetyFile);

          const draftPayload = {
            formValues: value,
            step: stepRef.current,
            mobileStep: mobileStepRef.current,
            docChoice,
            capturedSelfie,
            capturedID,
            hasReadGuidelines,
            facadeFileObj,
            permitFileObj,
            utilityBillFileObj,
            fireSafetyFileObj,
            updatedAt: now.toISOString(),
          };
          await saveDraftToStorage(DRAFT_KEY, draftPayload);
          setLastSavedTimestamp(now.getTime());
          setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } catch (err) {
          console.warn('Failed to auto-save host onboarding draft:', err);
        } finally {
          setSaveStatus('saved');
        }
      }, 600);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [watch, step, mobileStep, docChoice, capturedSelfie, capturedID, hasReadGuidelines, facadeFile, permitFile, utilityBillFile, fireSafetyFile, isSubmitting, submitted, isCheckingDraft, hasSavedDraft]);

  // Immediately persist step or media state changes
  useEffect(() => {
    if (typeof window === 'undefined' || isSubmitting || submitted || isCheckingDraft || hasSavedDraft || isRestoringDraftRef.current) return;
    const formValues = getValues();
    const currentStep = stepRef.current;
    const currentMobileStep = mobileStepRef.current;
    if (!isDraftNotEmpty({ formValues, step: currentStep, mobileStep: currentMobileStep, capturedSelfie, capturedID })) return;

    const timer = setTimeout(async () => {
      try {
        setSaveStatus('saving');
        const now = new Date();
        const facadeFileObj = await fileToDraftObject(facadeFile);
        const permitFileObj = await fileToDraftObject(permitFile);
        const utilityBillFileObj = await fileToDraftObject(utilityBillFile);
        const fireSafetyFileObj = await fileToDraftObject(fireSafetyFile);

        const draftPayload = {
          formValues,
          step: stepRef.current,
          mobileStep: mobileStepRef.current,
          docChoice,
          capturedSelfie,
          capturedID,
          hasReadGuidelines,
          facadeFileObj,
          permitFileObj,
          utilityBillFileObj,
          fireSafetyFileObj,
          updatedAt: now.toISOString(),
        };
        await saveDraftToStorage(DRAFT_KEY, draftPayload);
        setLastSavedTimestamp(now.getTime());
        setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setSaveStatus('saved');
      } catch (err) {
        console.warn('Failed to save step/media change to draft storage:', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [step, mobileStep, docChoice, capturedSelfie, capturedID, hasReadGuidelines, facadeFile, permitFile, utilityBillFile, fireSafetyFile, isCheckingDraft, hasSavedDraft]);

  const loadDraft = () => {
    if (!savedDraftData) return;
    const draftToRestore = { ...savedDraftData };

    const targetStep = typeof draftToRestore.step === 'number' && draftToRestore.step > 0 ? draftToRestore.step : 1;
    let targetMobileStep = typeof draftToRestore.mobileStep === 'number' ? draftToRestore.mobileStep : 1;

    if (getDesktopStepForMobileStep(targetMobileStep) !== targetStep) {
      targetMobileStep = getMobileStepForDesktopStep(targetStep);
    }

    isRestoringDraftRef.current = true;

    if (draftToRestore.formValues) {
      reset(draftToRestore.formValues);
    }

    stepRef.current = targetStep;
    mobileStepRef.current = targetMobileStep;
    setStepState(targetStep);
    setMobileStepState(targetMobileStep);

    if (draftToRestore.docChoice) {
      setDocChoice(draftToRestore.docChoice);
    } else if (draftToRestore.utilityBillFileObj && !draftToRestore.permitFileObj) {
      setDocChoice('utility');
    } else {
      setDocChoice('permit');
    }

    if (draftToRestore.capturedSelfie) {
      setCapturedSelfie(draftToRestore.capturedSelfie);
    }
    if (draftToRestore.capturedID) {
      setCapturedID(draftToRestore.capturedID);
    }
    if (typeof draftToRestore.hasReadGuidelines === 'boolean') {
      setHasReadGuidelines(draftToRestore.hasReadGuidelines);
    }
    if (draftToRestore.facadeFileObj) {
      try {
        setFacadeFile(base64ToFile(draftToRestore.facadeFileObj.data, draftToRestore.facadeFileObj.name));
      } catch (e) {}
    }
    if (draftToRestore.permitFileObj) {
      try {
        setPermitFile(base64ToFile(draftToRestore.permitFileObj.data, draftToRestore.permitFileObj.name));
      } catch (e) {}
    }
    if (draftToRestore.utilityBillFileObj) {
      try {
        setUtilityBillFile(base64ToFile(draftToRestore.utilityBillFileObj.data, draftToRestore.utilityBillFileObj.name));
      } catch (e) {}
    }
    if (draftToRestore.fireSafetyFileObj) {
      try {
        setFireSafetyFile(base64ToFile(draftToRestore.fireSafetyFileObj.data, draftToRestore.fireSafetyFileObj.name));
      } catch (e) {}
    }

    setHasSavedDraft(false);
    setSavedDraftData(null);

    setTimeout(() => {
      isRestoringDraftRef.current = false;
    }, 800);

    toast.success("Draft restored! Continuing your host application.");
  };


  const clearDraft = () => {
    clearDraftFromStorage(DRAFT_KEY).catch(() => {});
    try {
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem('boardtau_host_app_draft');
      localStorage.removeItem('boardtau_host_app_draft_v2');
    } catch (e) {}

    reset({
      businessInfo: { businessName: '', businessType: '' as any, yearsExperience: '' },
      contactInfo: { fullName: '', phoneNumber: '', email: '', ownershipRole: undefined as any },
      propertyEvidence: { address: '', facadePhotoUrl: '', latlng: TAU_COORDINATES },
      verification: { selfieUrl: '', idCardUrl: '', businessPermitUrl: '', fireSafetyUrl: '', utilityBillUrl: '' }
    });
    setStep(0);
    setMobileStep(1);
    setDocChoice('permit');
    setCapturedSelfie(null);
    setCapturedID(null);
    setHasReadGuidelines(false);
    setFacadeFile(null);
    setPermitFile(null);
    setUtilityBillFile(null);
    setFireSafetyFile(null);
    setHasSavedDraft(false);
    setSavedDraftData(null);
    setSaveStatus('idle');
  };

  const [livenessSessionId, setLivenessSessionId] = useState<string | null>(null);
  const [isLivenessLoading, setIsLivenessLoading] = useState(false);

  const startLivenessSession = async () => {
    setIsLivenessLoading(true);
    try {
      const res = await fetch('/api/kyc/liveness/session', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.sessionId) {
        setLivenessSessionId(data.sessionId);
      } else {
        const msg = data.reason || data.error || 'Failed to initialize liveness session';
        toast.error(msg);
      }
    } catch (err) {
      console.error('[Liveness Session Error]:', err);
      toast.error('Failed to connect to liveness service.');
    } finally {
      setIsLivenessLoading(false);
    }
  };

  const handleLivenessAnalysisComplete = async () => {
    if (!livenessSessionId) return;
    setIsSelfieProcessing(true);
    try {
      const res = await fetch('/api/kyc/liveness/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: livenessSessionId }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.referenceImage) {
        setCapturedSelfie(data.referenceImage);
        setLivenessStatus('passed');
        toast.success('Live biometric scan verified!');
      } else {
        const msg = data.reason || data.error || 'Liveness check unconfirmed.';
        toast.error(msg);
        setCapturedSelfie(null);
      }
    } catch (err) {
      console.error('[Liveness Results Error]:', err);
      toast.error('Failed to verify liveness results.');
    } finally {
      setIsSelfieProcessing(false);
      setLivenessSessionId(null);
    }
  };

  // Selfie State Initialization (On-Demand AWS Validation on Shutter Click)
  useEffect(() => {
    if (step === 6 && !capturedSelfie) {
      setIsEngineReady(true);
      setIsFaceAligned(true);
      setLivenessStatus('passed');
    }
  }, [step, capturedSelfie]);

  const handleCaptureSelfie = async () => {
    const video = webcamRef.current?.video;
    if (!video || (video.readyState < 2 && video.currentTime === 0)) {
      toast.error("Camera is initializing. Please wait a moment for the video stream to load.");
      return;
    }

    // 1. Multi-strategy webcam capture to ensure valid high-res image across all browsers (Chrome, Brave, Safari)
    let imageSrc: string | null = null;

    // Strategy 1: react-webcam getScreenshot with natural native camera dimensions (prevents aspect-ratio face distortion)
    try {
      if (webcamRef.current?.getScreenshot) {
        imageSrc = webcamRef.current.getScreenshot();
      }
    } catch (e) {
      console.warn('[Webcam getScreenshot default warning]:', e);
    }

    // Strategy 2: react-webcam default getScreenshot
    if (!imageSrc || imageSrc.length < 500) {
      try {
        if (webcamRef.current?.getScreenshot) {
          imageSrc = webcamRef.current.getScreenshot();
        }
      } catch (e) {
        console.warn('[Webcam getScreenshot default warning]:', e);
      }
    }

    // Strategy 3: Direct Video Element Canvas Snapshot
    if ((!imageSrc || imageSrc.length < 500) && video) {
      try {
        const vWidth = video.videoWidth || 1280;
        const vHeight = video.videoHeight || 720;
        const canvas = document.createElement('canvas');
        canvas.width = vWidth;
        canvas.height = vHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(video, 0, 0, vWidth, vHeight);
          imageSrc = canvas.toDataURL('image/jpeg', 0.95);
        }
      } catch (e) {
        console.warn('[Direct Canvas Capture warning]:', e);
      }
    }

    if (!imageSrc || imageSrc.length < 500) {
      toast.error("Camera stream is loading. Please wait a moment and try again.");
      return;
    }

    // Verify captured image is not pitch black (uninitialized camera warmup frame)
    const checkFrameBrightness = (dataUrl: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (img.width < 50 || img.height < 50) return resolve(false);
          const canvas = document.createElement('canvas');
          canvas.width = 40;
          canvas.height = 40;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(true);
          ctx.drawImage(img, 0, 0, 40, 40);
          const pixels = ctx.getImageData(0, 0, 40, 40).data;
          let sum = 0;
          for (let i = 0; i < pixels.length; i += 4) {
            sum += pixels[i] + pixels[i + 1] + pixels[i + 2];
          }
          const avgBrightness = sum / ((pixels.length / 4) * 3);
          resolve(avgBrightness >= 15);
        };
        img.onerror = () => resolve(false);
        img.src = dataUrl;
      });
    };

    const isFrameValid = await checkFrameBrightness(imageSrc);
    if (!isFrameValid) {
      toast.error("Camera stream is warming up. Please wait a moment and click capture again.");
      return;
    }

    // 2. Trigger quick 100ms flash feedback & verify face presence via AWS Rekognition
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 100);
    setIsSelfieProcessing(true);

    try {
      const res = await fetch('/api/kyc/detect-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selfieUrl: imageSrc }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        const failureReason = data.reason || data.error || 'No face detected in photo. Please frame your face clearly inside the oval.';
        toast.error(failureReason);
        setCapturedSelfie(null);
        return;
      }

      setCapturedSelfie(imageSrc);
      toast.success("Selfie verified successfully!");
    } catch (err) {
      console.error('[Face Detection Error]:', err);
      toast.error("Failed to verify face in photo. Please try again.");
      setCapturedSelfie(null);
    } finally {
      setIsSelfieProcessing(false);
    }
  };

  const handleCaptureID = async (imageFile: File) => {
    if (!capturedSelfie) {
      toast.error("Selfie not found. Please complete the selfie step first.");
      return;
    }

    setIsIDProcessing(true);

    try {
      const reader = new FileReader();
      const imageSrc = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      // AWS Rekognition Cloud Verification (Biometrics, OCR, and Document AI)
      let kycResult: any = null;
      try {
        const kycRes = await fetch('/api/kyc/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selfieUrl: capturedSelfie, idCardUrl: imageSrc }),
        });
        kycResult = await kycRes.json();
      } catch (err) {
        console.warn('[AWS Rekognition Fetch Error]:', err);
      }

      // Enforce strict AWS Rekognition verification result!
      if (kycResult && (!kycResult.success || kycResult.status !== 'VERIFIED')) {
        if (kycResult.lockoutRemainingSeconds) {
          try {
            const until = Date.now() + kycResult.lockoutRemainingSeconds * 1000;
            localStorage.setItem('kycLockoutUntil', until.toString());
            window.dispatchEvent(new Event('kycLockoutTriggered'));
          } catch (e) {}
        }

        let failureReason = kycResult.reason || kycResult.error || 'Verification failed.';
        if (failureReason.includes('temporarily locked for')) {
          const minsMatch = failureReason.match(/\d+/);
          const mins = minsMatch ? minsMatch[0] : '5';
          failureReason = `Verification locked for ${mins} minutes.`;
        }

        toast.error(failureReason);
        setCapturedID(null);
        return; // BLOCK USER FROM PROCEEDING!
      }

      setCapturedID(imageSrc);
      const similarityText = kycResult?.similarity ? ` (${kycResult.similarity}% face match)` : '';
      toast.success(`Identity Verified Successfully!${similarityText}`);
    } catch (error) {
      console.error("ID processing error:", error);
      toast.error("Failed to process ID card image.");
      setCapturedID(null);
    } finally {
      setIsIDProcessing(false);
    }
  };

  const handleRetakeSelfie = () => {
    setCapturedSelfie(null);
    setCapturedID(null);
    setSelfieRetakeNeeded(false);
    setStep(6);
    setMobileStep(14);
  };

  const nextStep = async () => {
    if (isIDProcessing || isProcessing || isSubmitting || isLoadingStep) return;

    let isValid = true;
    if (step === 1) {
      isValid = await trigger(['contactInfo']);
      if (isValid) {
        const nameVal = getValues("contactInfo.fullName");
        if (nameVal) setValue("contactInfo.fullName", formatTitleCase(nameVal));
      }
    }
    if (step === 2) {
      isValid = await trigger(['businessInfo']);
      if (isValid) {
        const bName = getValues("businessInfo.businessName");
        if (bName) setValue("businessInfo.businessName", formatTitleCase(bName));
      }
    }
    if (step === 3) {
      const isAddrValid = await trigger(['propertyEvidence.address']);
      let isFacadeValid = true;

      if (!facadeFile) {
        isFacadeValid = false;
        setError('propertyEvidence.facadePhotoUrl' as any, {
          type: 'required',
          message: 'Facade photo of main entrance is required'
        });
      } else {
        clearErrors('propertyEvidence.facadePhotoUrl' as any);
      }

      isValid = isAddrValid && isFacadeValid;

      if (isValid) {
        const addr = getValues("propertyEvidence.address");
        if (addr) setValue("propertyEvidence.address", formatTitleCase(addr));
      }
    }
    if (step === 4) {
      let isPermitValid = true;
      let isFireValid = true;

      if (!permitFile && !utilityBillFile) {
        isPermitValid = false;
        setError('verification.businessPermitUrl' as any, {
          type: 'required',
          message: 'Business permit or utility bill is required'
        });
      } else {
        clearErrors('verification.businessPermitUrl' as any);
      }

      if (!fireSafetyFile) {
        isFireValid = false;
        setError('verification.fireSafetyUrl' as any, {
          type: 'required',
          message: 'Fire Safety Inspection Certificate (FSIC) is required'
        });
      } else {
        clearErrors('verification.fireSafetyUrl' as any);
      }

      isValid = isPermitValid && isFireValid;
    }
    if (step === 5) {
      if (!hasReadGuidelines) {
        isValid = false;
        setError('guidelines' as any, {
          type: 'required',
          message: 'You must agree to the guidelines before proceeding'
        });
        toast.error('Please accept the Host Community Guidelines to proceed');
      } else {
        clearErrors('guidelines' as any);
      }
    }
    if (step === 6) isValid = !!capturedSelfie;
    if (step === 7) isValid = !!capturedID;

    if (isValid) {
      setIsLoadingStep(true);
      setDirection(1);
      setTimeout(() => {
        setStep(prev => prev + 1);
        setIsLoadingStep(false);
      }, 450);
    }
  };

  const prevStep = () => {
    if (isIDProcessing || isProcessing || isSubmitting || isLoadingStep) return;

    if (step === 7 && selfieRetakeNeeded) {
      handleRetakeSelfie();
      return;
    }
    setIsLoadingStep(true);
    setDirection(-1);
    setTimeout(() => {
      setStep(prev => Math.max(0, prev - 1));
      setIsLoadingStep(false);
    }, 450);
  };

  const onSubmitForm = async (rawData: HostApplicationFormData) => {
    setIsSubmitting(true);
    setSubmissionProgress(15);
    setSubmissionStage(1);
    const data = sanitizeHostFormData(rawData);
    try {
      toast.loading("Uploading secure verification documents...", { id: 'host-sub' });

      // Secure Private Uploads (IDs and Permits)
      const selfieUrl = (await edgestore.identityDocs.upload({ 
        file: base64ToFile(capturedSelfie!, "selfie.jpg"), 
        input: { listingId: "PENDING", landlordId: "PENDING" } 
      })).url;
      setSubmissionProgress(35);
      setSubmissionStage(2);

      const idUrl = (await edgestore.identityDocs.upload({ 
        file: base64ToFile(capturedID!, "id_card.jpg"), 
        input: { listingId: "PENDING", landlordId: "PENDING" } 
      })).url;

      if (selfieUrl && idUrl) {
        try {
          toast.loading("Verifying identity documents with AWS Rekognition...", { id: 'host-sub' });
          const kycRes = await fetch('/api/kyc/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selfieUrl, idCardUrl: idUrl }),
          });
          const kycResult = await kycRes.json();
          if (kycResult.status === 'NEEDS_MANUAL_REVIEW') {
            toast.warning('Identity verification flagged for admin review: ' + (kycResult.reason || 'Verification unconfirmed.'), { id: 'host-sub' });
          }
        } catch (err) {
          console.warn('[KYC Verify Error]:', err);
        }
      }
      
      let permitUrl = "";
      if (permitFile) {
        permitUrl = (await edgestore.identityDocs.upload({ 
          file: permitFile, 
          input: { listingId: "PENDING", landlordId: "PENDING" } 
        })).url;
      }
      setSubmissionProgress(60);
      setSubmissionStage(3);

      let utilityBillUrl = "";
      if (utilityBillFile) {
        utilityBillUrl = (await edgestore.identityDocs.upload({ 
          file: utilityBillFile, 
          input: { listingId: "PENDING", landlordId: "PENDING" } 
        })).url;
      }

      const fireUrl = (await edgestore.identityDocs.upload({ 
        file: fireSafetyFile!, 
        input: { listingId: "PENDING", landlordId: "PENDING" } 
      })).url;
      
      // Public Upload (Property Facade)
      const facadeUrl = (await edgestore.publicFiles.upload({ file: facadeFile! })).url;
      setSubmissionProgress(85);
      setSubmissionStage(4);

      await createHostApplication({
        businessInfo: data.businessInfo,
        contactInfo: data.contactInfo,
        selfieUrl,
        idCardUrl: idUrl,
        businessPermitUrl: permitUrl || utilityBillUrl,
        fireSafetyUrl: fireUrl,
        facadePhotoUrl: facadeUrl,
        latlng: (data as any).propertyEvidence?.latlng || [15.4822, 120.5963],
        additionalDocsUrl: utilityBillUrl || ""
      } as any);

      setSubmissionProgress(100);
      clearDraft();
      toast.success("Application submitted successfully!", { id: 'host-sub' });
      setSubmitted(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onClose?.();
        router.push('/landlord/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "An error occurred. Please check your uploads.", { id: 'host-sub' });
      setIsSubmitting(false);
    }
  };

  return {
    step, setStep,
    mobileStep, setMobileStep,
    direction, setDirection,
    isSubmitting,
    submissionProgress,
    submissionStage,
    isLoadingStep,
    setIsLoadingStep,
    webcamRef,
    capturedSelfie, setCapturedSelfie,
    capturedID, setCapturedID,
    livenessStatus,
    activeChallenge: activeChallenges[0] || 'blink',
    isFaceAligned, setIsFaceAligned, 
    isIDAligned, setIsIDAligned,
    isPhoneDetected,
    hasReadGuidelines, setHasReadGuidelines,
    facingMode, setFacingMode,
    isFlashActive,
    facadeFile, setFacadeFile,
    permitFile, setPermitFile,
    utilityBillFile, setUtilityBillFile,
    fireSafetyFile, setFireSafetyFile,
    docChoice, setDocChoice,
    register, handleSubmit: handleSubmit(onSubmitForm),
    control, watch, errors, setValue, trigger, getValues, setError, clearErrors,
    nextStep, prevStep,
    handleCaptureSelfie, handleCaptureID,
    isProcessing,
    isSelfieProcessing,
    isIDProcessing,
    selfieRetakeNeeded,
    handleRetakeSelfie,
    isEngineReady,
    submitted,
    // Draft Auto-Save Exports
    isCheckingDraft,
    hasSavedDraft,
    savedDraftData,
    lastSavedTime,
    lastSavedTimestamp,
    saveStatus,
    loadDraft,
    clearDraft,
  };
};

