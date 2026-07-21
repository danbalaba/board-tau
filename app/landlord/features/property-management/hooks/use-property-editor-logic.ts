'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEdgeStore } from '@/lib/edgestore';

// Zod Schema based on Creator parity
const propertySchema = z.object({
  title: z.string().min(3, "Display name must be at least 3 characters"),
  description: z.string().min(100, "Marketing narrative must be at least 100 characters"),
  price: z.coerce.number().min(500, "Min price ₱500").max(50000, "Max price ₱50,000"),
  category: z.string().min(1, "Please select a primary category"),
  totalRooms: z.coerce.number().min(1, "Min 1 room").max(50, "Max 50 rooms"),
  bathroomCount: z.coerce.number().min(0).max(10, "Max 10 bathrooms"),
  region: z.string().min(1, "Region is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().regex(/^\d{4}$/, "Must be 4 digits"),
  latlng: z.array(z.number()).length(2, "Location pinpoint required"),
  rules: z.object({
    femaleOnly: z.boolean(),
    maleOnly: z.boolean(),
    visitorsAllowed: z.boolean(),
    petsAllowed: z.boolean(),
    smokingAllowed: z.boolean(),
    noCurfew: z.boolean(),
    customRules: z.array(z.string()),
  }),
  features: z.object({
    security24h: z.boolean(),
    cctv: z.boolean(),
    fireSafety: z.boolean(),
    nearTransport: z.boolean(),
    floodFree: z.boolean(),
    backupPower: z.boolean(),
    customFeatures: z.array(z.string()),
  }),
  amenities: z.array(z.string()),
  customAmenities: z.array(z.string()),
  rooms: z.array(z.object({
    roomType: z.string().min(1, "Type required"),
    price: z.coerce.number().min(500),
    capacity: z.coerce.number().min(1),
    bedType: z.string().min(1),
    bedCount: z.coerce.number().min(1),
    size: z.coerce.number().min(5),
    reservationFee: z.coerce.number().min(500),
    amenities: z.array(z.string()),
  })).min(1, "At least one room unit required"),
});

export function usePropertyEditorLogic(initialData: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('basics');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { edgestore } = useEdgeStore();
  
  const [formData, setFormData] = useState({
    id: initialData.id,
    title: initialData.title || '',
    description: initialData.description || '',
    price: initialData.price || '',
    category: Array.isArray(initialData.category) ? (initialData.category[0] || '') : (initialData.category || ''),
    totalRooms: initialData.roomCount || '',
    bathroomCount: initialData.bathroomCount || '0',
    region: initialData.region || '',
    address: initialData.address || '',
    city: initialData.city || '',
    zipCode: initialData.zipCode || '',
    latlng: (initialData.latitude && initialData.longitude) 
      ? [initialData.longitude, initialData.latitude] 
      : (initialData.latlng || []),
    propertyFiles: [] as File[],
    existingImages: (initialData.images || []).map((img: any) => ({
      url: img.url,
      category: img.category || 'General'
    })),
    amenities: initialData.amenities_list || (initialData.amenities ? Object.entries(initialData.amenities)
      .filter(([key, val]) => val === true && key !== 'id' && key !== 'listingId')
      .map(([key]) => key) : []),
    customAmenities: initialData.amenities?.customAmenities || [],
    rules: {
      femaleOnly: initialData.rules?.femaleOnly || false,
      maleOnly: initialData.rules?.maleOnly || false,
      visitorsAllowed: initialData.rules?.visitorsAllowed ?? true,
      petsAllowed: initialData.rules?.petsAllowed || false,
      smokingAllowed: initialData.rules?.smokingAllowed || false,
      noCurfew: initialData.rules?.noCurfew || false,
      customRules: initialData.rules?.customRules || [],
    },
    features: {
      security24h: initialData.features?.security24h || false,
      cctv: initialData.features?.cctv || false,
      fireSafety: initialData.features?.fireSafety || false,
      nearTransport: initialData.features?.nearTransport ?? true,
      floodFree: initialData.features?.floodFree || false,
      backupPower: initialData.features?.backupPower || false,
      customFeatures: initialData.features?.customFeatures || [],
    },
    rooms: (initialData.rooms || []).map((r: any) => ({
      id: r.id,
      roomType: r.roomType,
      price: r.price,
      capacity: r.capacity,
      bedType: r.bedType,
      bedCount: r.bedCount,
      size: r.size,
      availableSlots: r.availableSlots,
      reservationFee: r.reservationFee,
      amenities: r.amenities?.map((a: any) => a.id) || [],
    }))
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      propertyFiles: [...prev.propertyFiles, ...files]
    }));
  };

  const deleteExistingImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((img: any) => img.url !== url)
    }));
  };

  const validate = (showUIFeedback = true) => {
    try {
      propertySchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const nestedErrors: any = {};
        
        err.issues.forEach((issue) => {
          let current = nestedErrors;
          const path = issue.path;
          
          for (let i = 0; i < path.length; i++) {
            const key = path[i];
            if (i === path.length - 1) {
              current[key] = issue.message;
            } else {
              if (!current[key]) {
                current[key] = typeof path[i + 1] === 'number' ? [] : {};
              }
              current = current[key];
            }
          }
        });

        setErrors(nestedErrors);
        
        if (showUIFeedback) {
          // Scroll to first error
          const firstIssue = err.issues[0];
          const firstErrorPath = firstIssue.path.join('.');
          const element = document.getElementsByName(firstErrorPath)[0] || document.getElementById(firstErrorPath);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          toast.error("Please fix the validation errors.");
        }
      }
      return false;
    }
  };

  // Real-time validation after first submit attempt
  useEffect(() => {
    if (hasSubmitted) {
      validate(false);
    }
  }, [formData, hasSubmitted]);

  const [isDirty, setIsDirty] = useState(false);
  
  // Track changes to enable/disable save button
  useEffect(() => {
    if (!isMounted) return;
    
    const checkIsDirty = () => {
      // Simple check for now: titles, price, and arrays length
      const hasBasicChanges = 
        formData.title !== (initialData.title || '') ||
        formData.description !== (initialData.description || '') ||
        formData.price !== (initialData.price || '') ||
        formData.category !== (Array.isArray(initialData.category) ? initialData.category[0] : (initialData.category || ''));
        
      const hasArrayChanges = 
        formData.amenities.length !== (initialData.amenities_list?.length || 0) ||
        formData.rooms.length !== (initialData.rooms?.length || 0);

      return hasBasicChanges || hasArrayChanges;
    };

    setIsDirty(checkIsDirty());
  }, [formData, initialData, isMounted]);

  const saveHistory = () => {
    setHistory(prev => [...prev.slice(-19), formData]); // Keep last 20 steps
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setFormData(lastState);
    toast.info('Reverted last change');
  };

  const handleReset = () => {
    setFormData({
      ...formData,
      title: initialData.title || '',
      description: initialData.description || '',
      price: initialData.price || '',
      category: Array.isArray(initialData.category) ? (initialData.category[0] || '') : (initialData.category || ''),
      amenities: initialData.amenities_list || [],
      rooms: (initialData.rooms || []).map((r: any) => ({
        id: r.id,
        roomType: r.roomType,
        price: r.price,
        capacity: r.capacity,
        bedType: r.bedType,
        bedCount: r.bedCount,
        size: r.size,
        availableSlots: r.availableSlots,
        reservationFee: r.reservationFee,
        amenities: r.amenities?.map((a: any) => a.id) || [],
      }))
    });
    setHistory([]);
    toast.success('All changes discarded');
  };

  const queryClient = useQueryClient();

  const updatePropertyMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch(`/api/landlord/properties?id=${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        let errorMessage = 'Failed to update property';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlordProperties'] });
      toast.success('Property successfully synchronized!');
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Connection error. Please try again.');
    }
  });

  const uploadWithRetry = async (uploadFn: () => Promise<any>, maxRetries = 2) => {
    let lastErr;
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await uploadFn();
      } catch (err: any) {
        lastErr = err;
        await new Promise(r => setTimeout(r, 1000 * (i + 1))); 
      }
    }
    throw lastErr;
  };

  const handleSubmitForm = () => {
    setHasSubmitted(true);
    if (!validate()) return;
    setIsDirty(false); 
    setHistory([]); 
    
    startTransition(async () => {
      try {
        let newImageUrls: any[] = [];
        if (formData.propertyFiles.length > 0) {
          const uploadPromises = formData.propertyFiles.map(async (file) => {
            const freshFile = new File([file], file.name, { type: file.type });
            const res = await uploadWithRetry(() => edgestore.publicFiles.upload({ file: freshFile }));
            return { url: res.url, category: 'General' }; 
          });
          newImageUrls = await Promise.all(uploadPromises);
        }
        
        const payload = {
          ...formData,
          images: [...formData.existingImages, ...newImageUrls]
        };
        
        await updatePropertyMutation.mutateAsync(payload);
      } catch (error) {
        console.error("Submission error:", error);
        // Error is caught here, preventing the global error boundary crash
      }
    });
  };

  // --- ROOM INVENTORY LOGIC ---
  const addRoom = () => {
    saveHistory();
    const newRoom = {
      name: `Unit ${formData.rooms.length + 1}`,
      price: formData.price || '0',
      capacity: '1',
      availableSlots: '1',
      roomType: 'SOLO',
      bathroomArrangement: 'PRIVATE_CR',
      bedType: 'SINGLE',
      bedCount: '1',
      size: '',
      reservationFee: '500',
      amenities: [],
      images: [],
    };
    setFormData((prev: any) => ({
      ...prev,
      rooms: [...prev.rooms, newRoom],
      totalRooms: (prev.rooms.length + 1).toString()
    }));
    toast.success('New unit added to inventory!');
  };

  const removeRoom = (index: number) => {
    saveHistory();
    if (formData.rooms.length <= 1) {
      toast.error('You must have at least one unit.');
      return;
    }
    setFormData((prev: any) => {
      const newRooms = [...prev.rooms];
      newRooms.splice(index, 1);
      return { 
        ...prev, 
        rooms: newRooms,
        totalRooms: newRooms.length.toString()
      };
    });
  };

  const updateRoom = (index: number, field: string, value: any) => {
    saveHistory();
    setFormData((prev: any) => {
      const newRooms = [...prev.rooms];
      newRooms[index] = { ...newRooms[index], [field]: value };
      
      if (field === 'bedCount' || field === 'bedType') {
        const bedCount = parseInt(newRooms[index].bedCount) || 1;
        const multiplier = newRooms[index].bedType === 'BUNK' ? 2 : 1;
        const capacity = (bedCount * multiplier).toString();
        newRooms[index].capacity = capacity;
        newRooms[index].availableSlots = capacity;
      }

      return { ...prev, rooms: newRooms };
    });
  };

  return {
    formData,
    setFormData,
    errors,
    isSubmitting: isPending,
    isMounted,
    isDirty,
    canUndo: history.length > 0,
    handleUndo,
    handleReset,
    saveHistory,
    activeSection,
    setActiveSection,
    handleImageChange,
    deleteExistingImage,
    handleSubmitForm,
    addRoom,
    removeRoom,
    updateRoom

  };
}
