'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBuilding, FaUpload, FaMapMarkerAlt, FaBed, FaBath, FaUsers, FaMoneyBill } from 'react-icons/fa';

export default function LandlordCreatePropertyClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    roomCount: '',
    bathroomCount: '',
    guestCount: '',
    location: '',
    image: null as File | null,
    amenities: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const amenitiesList = [
    'Wifi',
    'Air Conditioning',
    'Parking',
    'Kitchen',
    'Laundry',
    'Gym',
    'Swimming Pool',
    '24/7 Security',
    'Elevator',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        image: e.target.files![0],
      }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Property title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Property description is required';
    }

    if (!formData.price || parseInt(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.roomCount || parseInt(formData.roomCount) <= 0) {
      newErrors.roomCount = 'Valid number of rooms is required';
    }

    if (!formData.bathroomCount || parseInt(formData.bathroomCount) <= 0) {
      newErrors.bathroomCount = 'Valid number of bathrooms is required';
    }

    if (!formData.guestCount || parseInt(formData.guestCount) <= 0) {
      newErrors.guestCount = 'Valid number of guests is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Property location is required';
    }

    if (!formData.image) {
      newErrors.image = 'Property image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would implement the API call to create the property
      console.log('Creating property:', formData);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to properties page
      router.push('/landlord/properties');
    } catch (error) {
      console.error('Error creating property:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add Property
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Fill in the details to add your property to BoardTAU
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaBuilding size={18} />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Property Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter property title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaMapMarkerAlt className="inline mr-1" /> Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter property location"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter property description"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaBed size={18} />
            Property Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaMoneyBill className="inline mr-1" /> Price (₱/month)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter price"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="roomCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaBed className="inline mr-1" /> Rooms
              </label>
              <input
                type="number"
                id="roomCount"
                name="roomCount"
                value={formData.roomCount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of rooms"
              />
              {errors.roomCount && <p className="text-red-500 text-sm mt-1">{errors.roomCount}</p>}
            </div>

            <div>
              <label htmlFor="bathroomCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaBath className="inline mr-1" /> Bathrooms
              </label>
              <input
                type="number"
                id="bathroomCount"
                name="bathroomCount"
                value={formData.bathroomCount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of bathrooms"
              />
              {errors.bathroomCount && <p className="text-red-500 text-sm mt-1">{errors.bathroomCount}</p>}
            </div>

            <div>
              <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaUsers className="inline mr-1" /> Guests
              </label>
              <input
                type="number"
                id="guestCount"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Max guests"
              />
              {errors.guestCount && <p className="text-red-500 text-sm mt-1">{errors.guestCount}</p>}
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Amenities
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {amenitiesList.map((amenity) => (
              <label
                key={amenity}
                className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Property Image */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaUpload size={18} />
            Property Image
          </h2>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            {formData.image ? (
              <div className="space-y-4">
                <img
                  src={URL.createObjectURL(formData.image)}
                  alt="Property preview"
                  className="max-h-48 mx-auto object-contain"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">{formData.image.name}</p>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, image: null }))}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <FaUpload size={48} className="mx-auto text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <FaUpload size={14} className="mr-2" />
                  Browse Files
                </label>
              </div>
            )}
          </div>
          {errors.image && <p className="text-red-500 text-sm mt-2">{errors.image}</p>}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Property...
              </>
            ) : (
              <>
                Create Property
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
