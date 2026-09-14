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

import { faceMatcher } from '@/lib/mediapipe/face-matcher';

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
  const { isProcessing, faceEngine, idEngine } = useKYC();
  
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
  const [isIDProcessing, setIsIDProcessing] = useState(false);
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

  const [isEngineReady, setIsEngineReady] = useState(false);

  // Warm up / dispose face-engine based on step (Desktop Step 6 is Selfie Liveness)
  useEffect(() => {
    if (step === 6 && !capturedSelfie) {
      setIsEngineReady(false);
      faceEngine.warmup().then(() => setIsEngineReady(true));
    } else if (step !== 6 || capturedSelfie) {
      setIsEngineReady(false);
      faceEngine.dispose();
    }
  }, [step, capturedSelfie, faceEngine]);

  const getScaledCanvas = (video: HTMLVideoElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx?.drawImage(video, 0, 0, 320, 240);
    return canvas;
  };

  type ChallengeType = 'blink' | 'smile' | 'turnLeft' | 'turnRight' | 'openMouth' | 'raiseEyebrows';
  const previousChallengesRef = useRef<ChallengeType[]>([]);

  const generateUniqueRandomChallenges = (): ChallengeType[] => {
    const ALL: ChallengeType[] = ['blink', 'smile', 'turnLeft', 'turnRight', 'openMouth', 'raiseEyebrows'];
    let pool = ALL.filter(c => !previousChallengesRef.current.includes(c));
    if (pool.length < 2) pool = ALL;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);
    previousChallengesRef.current = selected;
    return selected;
  };

  useEffect(() => {
    if (step === 6 && !capturedSelfie) {
      setLivenessStatus('idle');
      setActiveChallenges(generateUniqueRandomChallenges());
      consecutiveFaceFailures.current = 0;
    }
  }, [step, capturedSelfie]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const isSelfieStep = step === 6;
    
    if (isSelfieStep && !capturedSelfie && !isProcessing) {
      interval = setInterval(async () => {
        const video = webcamRef.current?.video;
        if (video && video.readyState === 4) {
          const scaledCanvas = getScaledCanvas(video);
          
          const result = await faceEngine.quickValidateFace(scaledCanvas);
          setIsFaceAligned(result.isValid);
          
          if (livenessStatus === 'passed') {
            if (!result.isValid) {
              consecutiveFaceFailures.current += 1;
              if (consecutiveFaceFailures.current >= 3) {
                setLivenessStatus('idle');
                setActiveChallenges(generateUniqueRandomChallenges());
                consecutiveFaceFailures.current = 0;
              }
            } else {
              consecutiveFaceFailures.current = 0;
            }
            return;
          }

          const state = result.liveness;
          if (state && livenessStatus === 'idle' && activeChallenges.length > 0) {
            const currentChallenge = activeChallenges[0];
            if (
              (currentChallenge === 'blink' && state.blink) ||
              (currentChallenge === 'smile' && state.smile) ||
              (currentChallenge === 'turnLeft' && state.turnLeft) ||
              (currentChallenge === 'turnRight' && state.turnRight) ||
              (currentChallenge === 'openMouth' && state.openMouth) ||
              (currentChallenge === 'raiseEyebrows' && state.raiseEyebrows)
            ) {
              if (activeChallenges.length > 1) {
                setActiveChallenges(prev => prev.slice(1));
              } else {
                setLivenessStatus('passed');
              }
              consecutiveFaceFailures.current = 0;
            }
          }
        }
      }, 600);
    }
    return () => clearInterval(interval);
  }, [step, capturedSelfie, isProcessing, faceEngine, activeChallenges, livenessStatus]);

  const handleCaptureSelfie = async () => {
    const video = webcamRef.current?.video;
    if (!video) return;

    if (livenessStatus !== 'passed') {
      toast.error("Please perform the requested action to prove you are real.");
      return;
    }

    // 1. Capture the photo INSTANTLY at click time (0ms shutter lag)
    let imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc || imageSrc === 'data:,' || imageSrc.length < 500) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        imageSrc = canvas.toDataURL('image/jpeg', 0.92);
      }
    }

    if (!imageSrc || imageSrc.length < 500) {
      toast.error("Failed to capture photo. Please try again.");
      return;
    }

    // 2. Trigger quick 100ms flash feedback
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 100);

    // 3. Perform ML face validation
    try {
      const result = await faceEngine.validateFace(video);
      if (!result.isValid) {
        toast.error(result.reason || "Selfie verification failed.");
        return;
      }

      setCapturedSelfie(imageSrc);
      toast.success("Face verified successfully!");
    } catch (e) {
      console.error("Selfie capture error:", e);
      toast.error("An error occurred during verification.");
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

      const [selfieImg, idImg] = await Promise.all([
        loadImage(capturedSelfie),
        loadImage(imageSrc)
      ]);

      const selfieCacheKey = `selfie_${capturedSelfie.length}_${capturedSelfie.slice(0, 50)}`;
      const idCacheKey = `file_${imageFile.name}_${imageFile.size}_${imageFile.lastModified}`;

      const [selfieDescriptor, idDescriptor] = await Promise.all([
        faceMatcher.getFaceDescriptorCached(selfieCacheKey, selfieImg),
        faceMatcher.getFaceDescriptorCached(idCacheKey, idImg, 0.2)
      ]);

      if (!selfieDescriptor) {
        setSelfieRetakeNeeded(true);
        toast.error("Could not verify your live selfie. Please retake it.");
        return;
      }

      setSelfieRetakeNeeded(false);

      if (!idDescriptor) {
        toast.error("Could not detect a face on your ID card. Please ensure the ID photo is clearly visible.");
        return;
      }

      const distance = faceMatcher.getFaceDistance(selfieDescriptor, idDescriptor);
      if (distance > 0.6) {
        toast.error("Verification failed: The face on the ID does not match your live selfie. Please try again.");
        return;
      }

      setCapturedID(imageSrc);
      toast.success("ID card matched successfully!");
    } catch (error) {
      console.error("Face matching error:", error);
      toast.error("Failed to perform face matching.");
    } finally {
      setIsIDProcessing(false);
    }
  };

  const handleRetakeSelfie = () => {
    setCapturedSelfie(null);
    setSelfieRetakeNeeded(false);
    setStep(6);
  };

  const nextStep = async () => {
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
      }, 600);
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

