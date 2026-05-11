import { useState, useCallback } from 'react';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { useEdgeStore } from '@/lib/edgestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useEditRoom(initialData: any, onSuccess: () => void, onClose: () => void) {
  const [loading, setLoading] = useState(false);
  const { edgestore } = useEdgeStore();
  const responsiveToast = useResponsiveToast();
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  
  const initialFormState = {
    name: initialData?.name || '',
    description: initialData?.description || '',
    roomType: initialData?.roomType || '',
    bathroomArrangement: initialData?.bathroomArrangement || '',
    bedType: initialData?.bedType || '',
    bedCount: initialData?.bedCount?.toString() || '0',
    price: initialData?.price?.toString() || '',
    capacity: initialData?.capacity?.toString() || '0',
    availableSlots: initialData?.availableSlots?.toString() || '0',
    reservationFee: initialData?.reservationFee?.toString() || '',
    size: initialData?.size?.toString() || '',
    amenities: (initialData?.amenities || []).map((a: any) => typeof a === 'string' ? a : a.amenityType?.name || a),
    images: (initialData?.images || []).map((img: any) => img.url || img)
  };

  const [formData, setFormData] = useState(initialFormState);
  const [history, setHistory] = useState<any[]>([]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialFormState) || files.length > 0 || deletedImages.length > 0;
  const canUndo = history.length > 0;

  const saveHistory = useCallback(() => {
    setHistory(prev => {
      const newState = { 
        formData: JSON.parse(JSON.stringify(formData)), 
        files: [...files], 
        deletedImages: [...deletedImages] 
      };
      const newHistory = [...prev, newState];
      return newHistory.slice(-20); // Keep last 20 steps
    });
  }, [formData, files, deletedImages]);

  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousState = newHistory.pop();
      setHistory(newHistory);
      
      if (previousState && previousState.formData) {
        setFormData(previousState.formData);
        setFiles(previousState.files || []);
        setDeletedImages(previousState.deletedImages || []);
      }
    }
  }, [history]);

  const handleReset = () => {
    setFormData(initialFormState);
    setHistory([]);
    setFiles([]);
    setDeletedImages([]);
    setErrors({});
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    saveHistory();
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // RESET LOGIC WHEN ROOM TYPE CHANGES
      if (name === 'roomType') {
        newData.bedType = '';
        newData.bedCount = '';
        newData.capacity = '0';
        newData.availableSlots = '0';
        newData.amenities = [];
      }

      // AUTO CALCULATION LOGIC
      if (name === 'bedType' || name === 'bedCount' || name === 'roomType') {
        const type = newData.roomType;
        const bType = newData.bedType;
        const bCount = Number(newData.bedCount) || 0;
        
        if (!bType || bCount === 0) {
          newData.capacity = '0';
        } else if (type === 'BEDSPACE') {
          newData.capacity = bType === 'BUNK' ? (bCount * 2).toString() : bCount.toString();
        } else {
          newData.capacity = bCount.toString();
        }
        newData.availableSlots = newData.capacity;
      }
      
      return newData;
    });

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAmenityToggle = (val: string) => {
    saveHistory();
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(val)
        ? prev.amenities.filter((a: string) => a !== val)
        : [...prev.amenities, val]
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Name
    if (!formData.name) newErrors.name = 'Room name is required';
    
    // Price
    const price = Number(formData.price);
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (price < 500) {
      newErrors.price = 'Min ₱500';
    } else if (price > 50000) {
      newErrors.price = 'Max ₱50,000';
    }

    // Reservation Fee
    const resFee = Number(formData.reservationFee);
    if (!formData.reservationFee) {
      newErrors.reservationFee = 'Fee is required';
    } else if (resFee < 500) {
      newErrors.reservationFee = 'Min ₱500';
    } else if (resFee > 50000) {
      newErrors.reservationFee = 'Max ₱50,000';
    }

    // Bed Type & Count
    if (!formData.bedType) newErrors.bedType = 'Required';
    const bedCount = Number(formData.bedCount);
    if (!formData.bedCount || bedCount < 1) {
      newErrors.bedCount = 'Min 1';
    } else if (bedCount > 10) {
      newErrors.bedCount = 'Max 10';
    }

    // Capacity
    const capacity = Number(formData.capacity);
    if (capacity <= 0) {
      newErrors.capacity = 'Required';
    } else if (formData.roomType === 'BEDSPACE' && capacity <= 1) {
      newErrors.capacity = 'Must be > 1';
    }

    // Size
    const size = Number(formData.size);
    if (!formData.size) {
      newErrors.size = 'Required';
    } else if (size < 5) {
      newErrors.size = 'Min 5 sqm';
    } else if (size > 100) {
      newErrors.size = 'Max 100 sqm';
    }

    // Description
    if (!formData.description || formData.description.length < 20) {
      newErrors.description = 'Need 20+ chars';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const queryClient = useQueryClient();

  const updateRoomMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch(`/api/landlord/rooms/${initialData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to update room');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlordRooms'] });
      responsiveToast.success({
        title: "SUCCESS",
        description: "Room updated successfully!"
      });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    },
    onError: (error: any) => {
      responsiveToast.error({ title: "ERROR", description: error.message || 'An unexpected error occurred' });
    }
  });

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    let imageUrls = [...formData.images].filter((img: string) => !deletedImages.includes(img));

    try {
      if (files.length > 0) {
        setUploadingImages(true);
        const uploadPromises = files.map(file => edgestore.publicFiles.upload({ file }));
        const uploads = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...uploads.map(u => u.url)];
      }

      await updateRoomMutation.mutateAsync({
        ...formData,
        images: imageUrls,
        price: Number(formData.price),
        capacity: Number(formData.capacity),
        availableSlots: Number(formData.availableSlots),
        bedCount: Number(formData.bedCount),
        reservationFee: formData.reservationFee ? Number(formData.reservationFee) : 0,
        size: formData.size ? Number(formData.size) : null,
      });

    } catch (error) {
      // Handled in onError
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  return { 
    loading, uploadingImages, errors, formData, handleChange, handleAmenityToggle, 
    files, setFiles, deletedImages, setDeletedImages, handleSubmit, submitted,
    isDirty, canUndo, handleUndo, handleReset, saveHistory
  };
}
