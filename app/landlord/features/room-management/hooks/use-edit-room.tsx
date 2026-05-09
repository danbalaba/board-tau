import { useState } from 'react';
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
  
  const [formData, setFormData] = useState({
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
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
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
      }
      return newData;
    });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAmenityToggle = (val: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(val)
        ? prev.amenities.filter((a: string) => a !== val)
        : [...prev.amenities, val]
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Room name is required';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Valid price required';
    if (Number(formData.capacity) <= 0) newErrors.capacity = 'Capacity cannot be zero';
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

  return { loading, uploadingImages, errors, formData, handleChange, handleAmenityToggle, files, setFiles, deletedImages, setDeletedImages, handleSubmit, submitted };
}
