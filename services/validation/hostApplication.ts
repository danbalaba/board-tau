import { validateEmail, validatePassword, validateName, validatePhoneNumber } from "@/lib/validators";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

import validator from 'validator';

/**
 * Basic sanitization to prevent XSS and SQL injection patterns in frontend strings
 */
export const sanitizeString = (str: string): string => {
  if (!str) return '';
  
  // Neutralize XSS completely via HTML entity encoding rather than fragile regex stripping
  const encoded = validator.escape(str.trim());
  
  return encoded
    .replace(/SELECT\s+.*FROM|DROP\s+TABLE|DELETE\s+FROM|UNION\s+SELECT/gi, '') // Basic SQL Injection: remove common keywords
    .slice(0, 2000);                  // Prevent massive inputs
};

export const validateStep = (step: number, formData: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Clone and sanitize critical string fields
  if (formData.propertyInfo) {
    formData.propertyInfo.propertyName = sanitizeString(formData.propertyInfo.propertyName);
    formData.propertyInfo.description = sanitizeString(formData.propertyInfo.description);
  }
  if (formData.businessInfo) {
    formData.businessInfo.businessName = sanitizeString(formData.businessInfo.businessName);
    formData.businessInfo.businessDescription = sanitizeString(formData.businessInfo.businessDescription);
  }
  if (formData.contactInfo) {
    formData.contactInfo.fullName = sanitizeString(formData.contactInfo.fullName);
  }
  if (formData.propertyConfig?.rooms) {
    formData.propertyConfig.rooms.forEach((room: any) => {
      if (room.description) room.description = sanitizeString(room.description);
    });
  }

  switch (step) {
    case 1: // LANDLORD_INFO
      validateContactInfo(formData.contactInfo || {}, errors);
      validateBusinessDescription(formData.businessInfo || {}, errors);
      break;

    case 2: // PROPERTY_BASIC
      validateBusinessInfo(formData.businessInfo || {}, errors);
      validatePropertyInfo(formData.propertyInfo || {}, errors);
      break;

    case 3: // LOCATION
      validateLocation(formData.location || {}, errors);
      break;

    case 4: // PROPERTY_CONFIG
      validatePropertyBasicConfig(formData.propertyConfig || {}, errors);
      break;

    case 5: // ROOM_CONFIG
      validateRoomConfig(formData.propertyConfig || {}, errors);
      break;

    case 6: // PROPERTY_IMAGES
      validatePropertyImages(formData.propertyImages || {}, formData.propertyConfig || {}, errors);
      break;

    case 7: // DOCUMENTS
      validateDocuments(formData.documents || {}, errors);
      break;

    case 8: // REVIEW
      // Validate all fields on review step
      validateContactInfo(formData.contactInfo || {}, errors);
      validateBusinessInfo(formData.businessInfo || {}, errors);
      validatePropertyInfo(formData.propertyInfo || {}, errors);
      validateLocation(formData.location || {}, errors);
      validatePropertyBasicConfig(formData.propertyConfig || {}, errors);
      validateRoomConfig(formData.propertyConfig || {}, errors);
      validatePropertyImages(formData.propertyImages || {}, formData.propertyConfig || {}, errors);
      validateDocuments(formData.documents || {}, errors);
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

const validateBusinessDescription = (businessInfo: any, errors: ValidationError[]): void => {
  const trimmedDescription = businessInfo.businessDescription?.trim() || '';
  if (!trimmedDescription || trimmedDescription.length < 50) {
    errors.push({ field: 'businessInfo.businessDescription', message: 'Business description must be at least 50 characters' });
  }
};

const validateContactInfo = (contactInfo: any, errors: ValidationError[]): void => {
  const nameError = validateName(contactInfo.fullName);
  if (nameError) {
    errors.push({ field: 'contactInfo.fullName', message: nameError });
  }

  const phoneError = validatePhoneNumber(contactInfo.phoneNumber);
  if (phoneError) {
    errors.push({ field: 'contactInfo.phoneNumber', message: phoneError });
  }

  const emailError = validateEmail(contactInfo.email);
  if (emailError) {
    errors.push({ field: 'contactInfo.email', message: emailError });
  }

  // Emergency contact validation
  const emergencyNameError = validateName(contactInfo.emergencyContact?.name);
  if (emergencyNameError) {
    errors.push({ field: 'contactInfo.emergencyContact.name', message: emergencyNameError });
  }

  if (!contactInfo.emergencyContact?.relationship) {
    errors.push({ field: 'contactInfo.emergencyContact.relationship', message: 'Please select a relationship' });
  }

  const emergencyPhoneError = validatePhoneNumber(contactInfo.emergencyContact?.phoneNumber);
  if (emergencyPhoneError) {
    errors.push({ field: 'contactInfo.emergencyContact.phoneNumber', message: emergencyPhoneError });
  }
};

const validateBusinessInfo = (businessInfo: any, errors: ValidationError[]): void => {
  const trimmedName = businessInfo.businessName?.trim() || '';
  if (!trimmedName || trimmedName.length < 3) {
    errors.push({ field: 'businessInfo.businessName', message: 'Business name must be at least 3 characters' });
  }

  if (!businessInfo.businessType) {
    errors.push({ field: 'businessInfo.businessType', message: 'Please select a business type' });
  }

  if (!businessInfo.yearsExperience) {
    errors.push({ field: 'businessInfo.yearsExperience', message: 'Please select years of experience' });
  }
};

const validatePropertyInfo = (propertyInfo: any, errors: ValidationError[]): void => {
  const trimmedName = propertyInfo.propertyName?.trim() || '';
  if (!trimmedName || trimmedName.length < 3) {
    errors.push({ field: 'propertyInfo.propertyName', message: 'Property name must be at least 3 characters' });
  }

  const trimmedDescription = propertyInfo.description?.trim() || '';
  if (!trimmedDescription || trimmedDescription.length < 50) {
    errors.push({ field: 'propertyInfo.description', message: 'Property description must be at least 50 characters' });
  }

  if (!propertyInfo.category || propertyInfo.category.length === 0) {
    errors.push({ field: 'propertyInfo.category', message: 'Please select at least one property category' });
  }

   const price = Number(propertyInfo.price);
   if (!price || price < 100 || price > 100000) {
     errors.push({ field: 'propertyInfo.price', message: 'Price must be between ₱100 and ₱100,000 per month' });
   }

  if (!propertyInfo.leaseTerms) {
    errors.push({ field: 'propertyInfo.leaseTerms', message: 'Please select lease terms' });
  }
};

const validateLocation = (location: any, errors: ValidationError[]): void => {
  if (!location.address) {
    errors.push({ field: 'location.address', message: 'Please enter a complete address' });
  }

  if (!location.city) {
    errors.push({ field: 'location.city', message: 'Please enter a city' });
  }

  if (!location.province) {
    errors.push({ field: 'location.province', message: 'Please enter a province' });
  }

  if (!location.zipCode || !/^\d{4,5}$/.test(location.zipCode)) {
    errors.push({ field: 'location.zipCode', message: 'Please enter a valid zip code' });
  }

  if (!location.coordinates || location.coordinates.length !== 2) {
    errors.push({ field: 'location.coordinates', message: 'Please select a location on the map' });
  }
};

const validatePropertyBasicConfig = (propertyConfig: any, errors: ValidationError[]): void => {
  const totalRooms = Number(propertyConfig.totalRooms);
  if (!totalRooms || totalRooms < 1 || totalRooms > 50) {
    errors.push({ field: 'propertyConfig.totalRooms', message: 'Total rooms must be between 1 and 50' });
  }

  if (!propertyConfig.bathroomType) {
    errors.push({ field: 'propertyConfig.bathroomType', message: 'Please select a bathroom type' });
  }

  const bathroomCount = Number(propertyConfig.bathroomCount);
  if (isNaN(bathroomCount) || bathroomCount < 0) {
    errors.push({ field: 'propertyConfig.bathroomCount', message: 'Please enter a valid bathroom count' });
  }
};

const validateRoomConfig = (propertyConfig: any, errors: ValidationError[]): void => {
  if (!propertyConfig.rooms || propertyConfig.rooms.length === 0) {
    errors.push({ field: 'propertyConfig.rooms', message: 'Please add at least one room configuration' });
  } else {
    propertyConfig.rooms.forEach((room: any, index: number) => {
      if (!room.roomType) {
        errors.push({ field: `propertyConfig.rooms[${index}].roomType`, message: `Room type is required for room ${index + 1}` });
      }

      const price = Number(room.price);
      if (!price || price < 100) {
        errors.push({ field: `propertyConfig.rooms[${index}].price`, message: `Valid price is required for room ${index + 1}` });
      }

      if (!room.bedType) {
        errors.push({ field: `propertyConfig.rooms[${index}].bedType`, message: `Bed type is required for room ${index + 1}` });
      }

      const capacity = Number(room.capacity);
      if (!capacity || capacity < 1) {
        errors.push({ field: `propertyConfig.rooms[${index}].capacity`, message: `Capacity must be at least 1 for room ${index + 1}` });
      }

      if (!room.bathroomArrangement) {
        errors.push({ field: `propertyConfig.rooms[${index}].bathroomArrangement`, message: `Bathroom arrangement is required for room ${index + 1}` });
      }

      if (!room.description || room.description.length < 10) {
        errors.push({ field: `propertyConfig.rooms[${index}].description`, message: `Description for room ${index + 1} must be at least 10 characters` });
      }

      // Validate room type specific fields
      if (room.roomType === 'SOLO' || room.roomType === 'solo') {
        const size = Number(room.size);
        if (!size || size < 1) {
          errors.push({ field: `propertyConfig.rooms[${index}].size`, message: `Room size is required for room ${index + 1}` });
        }
      } else if (room.roomType === 'BEDSPACE' || room.roomType === 'bedspace') {
        const availableSlots = Number(room.availableSlots);
        if (availableSlots === undefined || isNaN(availableSlots) || availableSlots < 0) {
          errors.push({ field: `propertyConfig.rooms[${index}].availableSlots`, message: `Available slots is required for room ${index + 1}` });
        }
      }
    });
  }
};

const validatePropertyImages = (propertyImages: any, propertyConfig: any, errors: ValidationError[]): void => {
  // Check property images
  const pImages = propertyImages?.property || [];
  if (pImages.length === 0) {
    errors.push({ field: 'propertyImages.property', message: 'Property images are required. Please upload at least 3 images.' });
  } else if (pImages.length < 3) {
    errors.push({ field: 'propertyImages.property', message: `At least 3 property images are required (currently: ${pImages.length}).` });
  }

  // Check room images
  const rooms = propertyConfig?.rooms || [];
  const rImages = propertyImages?.rooms || {};
  let roomsMissingImages = 0;

  rooms.forEach((_: any, index: number) => {
    const images = rImages[index] || [];
    if (images.length < 1) {
      roomsMissingImages++;
      errors.push({ field: `propertyImages.rooms[${index}]`, message: `Please upload at least 1 image for Room ${index + 1}` });
    }
  });

  // Add a general error if any room images are missing, for easier toast reporting
  if (roomsMissingImages > 0) {
    // Only add this if it's the absolute first error to avoid duplication in toast
    if (roomsMissingImages === rooms.length) {
      errors.unshift({ field: 'propertyImages.rooms', message: 'Room images are required for all rooms.' });
    }
  }
};

const validateDocuments = (documents: any, errors: ValidationError[]): void => {
  if (!documents) {
    errors.push({ field: 'documents', message: 'All required documents must be uploaded' });
    return;
  }

  const requiredDocuments = ['governmentId', 'businessPermit', 'landTitle', 'barangayClearance', 'fireSafetyCertificate'];

  for (const doc of requiredDocuments) {
    const documentValue = documents[doc];
    if (!documentValue || typeof documentValue !== 'string' || (!documentValue.startsWith('http') && !documentValue.startsWith('blob:'))) {
      errors.push({ field: `documents.${doc}`, message: `Please upload a valid ${doc} document` });
    }
  }
};
