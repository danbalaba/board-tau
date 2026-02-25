import { validateEmail, validatePassword, validateName, validatePhoneNumber } from "@/lib/validators";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export const validateStep = (step: number, formData: any): ValidationResult => {
  const errors: ValidationError[] = [];

  switch (step) {
    case 1: // Landlord Info Step
      validateContactInfo(formData.contactInfo, errors);
      validateBusinessDescription(formData.businessInfo, errors);
      break;

    case 2: // Property Basic Step
      validateBusinessInfo(formData.businessInfo, errors);
      validatePropertyInfo(formData.propertyInfo, errors);
      break;

    case 3: // Location Step
      validateLocation(formData.location, errors);
      break;

    case 4: // Property Config Step (only property-level fields)
      validatePropertyBasicConfig(formData.propertyConfig, errors);
      break;

    case 5: // Room Config Step
      validateRoomConfig(formData.propertyConfig, errors);
      break;

    case 6: // Property Images Step
      // No validation needed for images
      break;

    case 7: // Documents Step
      validateDocuments(formData.documents, errors);
      break;

    case 8: // Review Step
      // Validate all fields on review step
      validateContactInfo(formData.contactInfo, errors);
      validateBusinessInfo(formData.businessInfo, errors);
      validatePropertyInfo(formData.propertyInfo, errors);
      validateLocation(formData.location, errors);
      validatePropertyBasicConfig(formData.propertyConfig, errors);
      validateRoomConfig(formData.propertyConfig, errors);
      validateDocuments(formData.documents, errors);
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

  const bathroomCount = Number(propertyConfig.bathroomCount);
  if (!bathroomCount || bathroomCount < 1) {
    errors.push({ field: 'propertyConfig.bathroomCount', message: 'Number of bathrooms must be at least 1' });
  }

  if (!propertyConfig.bathroomType) {
    errors.push({ field: 'propertyConfig.bathroomType', message: 'Please select a bathroom type' });
  }
};

const validateRoomConfig = (propertyConfig: any, errors: ValidationError[]): void => {
  if (!propertyConfig.rooms || propertyConfig.rooms.length === 0) {
    errors.push({ field: 'propertyConfig.rooms', message: 'Please add at least one room type' });
  } else {
    propertyConfig.rooms.forEach((room: any, index: number) => {
      if (!room.roomType) {
        errors.push({ field: `propertyConfig.rooms[${index}].roomType`, message: `Room type is required for room ${index + 1}` });
      }

      const count = Number(room.count);
      if (!count || count < 1 || count > 20) {
        errors.push({ field: `propertyConfig.rooms[${index}].count`, message: `Room count must be between 1 and 20 for room ${index + 1}` });
      }

       const price = Number(room.price);
       if (!price || price < 100 || price > 100000) {
         errors.push({ field: `propertyConfig.rooms[${index}].price`, message: `Price must be between ₱100 and ₱100,000 for room ${index + 1}` });
       }

      if (!room.bedType) {
        errors.push({ field: `propertyConfig.rooms[${index}].bedType`, message: `Please select a bed type for room ${index + 1}` });
      }

      const capacity = Number(room.capacity);
      if (!capacity || capacity < 1 || capacity > 10) {
        errors.push({ field: `propertyConfig.rooms[${index}].capacity`, message: `Capacity must be between 1 and 10 for room ${index + 1}` });
      }

      // Validate room type specific fields
      if (room.roomType === 'solo') {
        const size = Number(room.size);
        if (!size || size < 1 || size > 200) {
          errors.push({ field: `propertyConfig.rooms[${index}].size`, message: `Room size must be between 1 and 200 sq. meters for room ${index + 1}` });
        }
      } else if (room.roomType === 'bedspace') {
        const availableSlots = Number(room.availableSlots);
        if (!availableSlots || availableSlots < 0 || availableSlots > 10) {
          errors.push({ field: `propertyConfig.rooms[${index}].availableSlots`, message: `Available slots must be between 0 and 10 for room ${index + 1}` });
        }
      }

      // Validate room amenities
      if (room.amenities && !Array.isArray(room.amenities)) {
        errors.push({ field: `propertyConfig.rooms[${index}].amenities`, message: `Room amenities must be an array for room ${index + 1}` });
      }
    });
  }
};

const validateDocuments = (documents: any, errors: ValidationError[]): void => {
  const requiredDocuments = ['governmentId', 'businessPermit', 'landTitle', 'barangayClearance', 'fireSafetyCertificate'];

  for (const doc of requiredDocuments) {
    const documentValue = documents[doc];
    if (!documentValue || !documentValue.startsWith('http')) {
      errors.push({ field: `documents.${doc}`, message: `Please upload a valid ${doc} document` });
    }
  }
};
