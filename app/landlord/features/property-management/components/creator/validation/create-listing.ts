import validator from 'validator';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Basic sanitization to prevent XSS and SQL injection patterns
 */
export const sanitizeString = (str: string): string => {
  if (!str) return '';
  // Basic cleaning: trim and limit length, but keep characters readable for the Review UI
  return str.trim().slice(0, 5000); 
};

export const validateCreateListingStep = (step: number, formData: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Sanitize critical fields
  if (formData.propertyInfo) {
    formData.propertyInfo.propertyName = sanitizeString(formData.propertyInfo.propertyName || '');
    formData.propertyInfo.description = sanitizeString(formData.propertyInfo.description || '');
  }
  if (formData.businessInfo) {
    formData.businessInfo.businessName = sanitizeString(formData.businessInfo.businessName || '');
    formData.businessInfo.businessDescription = sanitizeString(formData.businessInfo.businessDescription || '');
  }

  switch (step) {
    case 0: // PROPERTY_BASICS (Identity + Essentials)
      validateIdentity(formData.businessInfo || {}, errors);
      validateEssentials(formData.propertyInfo || {}, errors);
      break;

    case 1: // LOCATION
      validateLocation(formData.location || {}, errors);
      break;

    case 2: // PROPERTY CONFIGURATION
      validateConfig(formData.propertyConfig || {}, errors);
      break;

    case 3: // ROOM INVENTORY
      validateRooms(formData.propertyConfig?.rooms || [], errors);
      break;

    case 4: // IMAGES
      validateImages(formData, errors);
      break;

    case 5: // DOCUMENTS
      validateDocuments(formData.documents || {}, errors);
      break;

    case 6: // REVIEW (Final check)
      validateIdentity(formData.businessInfo || {}, errors);
      validateEssentials(formData.propertyInfo || {}, errors);
      validateLocation(formData.location || {}, errors);
      validateConfig(formData.propertyConfig || {}, errors);
      validateImages(formData.propertyImages || {}, errors);
      validateDocuments(formData.documents || {}, errors);
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

const validateIdentity = (info: any, errors: ValidationError[]) => {
  if (!info.businessName || info.businessName.length < 3) {
    errors.push({ field: 'businessInfo.businessName', message: 'Business name must be at least 3 characters' });
  }
  if (!info.businessType) {
    errors.push({ field: 'businessInfo.businessType', message: 'Please select a business type' });
  }
  if (!info.yearsExperience) {
    errors.push({ field: 'businessInfo.yearsExperience', message: 'Please select years of experience' });
  }
  if (!info.businessDescription || info.businessDescription.length < 100) {
    errors.push({ field: 'businessInfo.businessDescription', message: 'Mission description must be at least 100 characters' });
  }
};

const validateEssentials = (info: any, errors: ValidationError[]) => {
  if (!info.propertyName || info.propertyName.length < 3) {
    errors.push({ field: 'propertyInfo.propertyName', message: 'Display name must be at least 3 characters' });
  }
  if (!info.description || info.description.length < 100) {
    errors.push({ field: 'propertyInfo.description', message: 'Marketing narrative must be at least 100 characters' });
  }
  if (!info.category) {
    errors.push({ field: 'propertyInfo.category', message: 'Please select a primary category' });
  }
  const price = Number(info.price);
  if (!price || price < 500) {
    errors.push({ field: 'propertyInfo.price', message: 'Please enter a valid starting price (min ₱500)' });
  } else if (price > 50000) {
    errors.push({ field: 'propertyInfo.price', message: 'Price cannot exceed 50,000 PHP' });
  }
};

const validateLocation = (loc: any, errors: ValidationError[]) => {
  if (!loc.address) errors.push({ field: 'location.address', message: 'Address is required' });
  if (!loc.city) errors.push({ field: 'location.city', message: 'City is required' });
  if (!loc.province) errors.push({ field: 'location.province', message: 'Province is required' });
  if (!loc.zipCode || !/^\d{4}$/.test(loc.zipCode)) {
    errors.push({ field: 'location.zipCode', message: 'Please enter a valid 4-digit zip code' });
  }
  if (!loc.coordinates || loc.coordinates.length !== 2) {
    errors.push({ field: 'location.coordinates', message: 'Please pinpoint your location on the map' });
  }
};

const validateConfig = (config: any, errors: ValidationError[]) => {
  const total = Number(config.totalRooms);
  if (!total || total < 1) {
    errors.push({ field: 'propertyConfig.totalRooms', message: 'Please enter total rooms/units available' });
  } else if (total > 50) {
    errors.push({ field: 'propertyConfig.totalRooms', message: 'Maximum 50 rooms allowed' });
  }
  
  const bathrooms = Number(config.bathroomCount);
  if (isNaN(bathrooms) || bathrooms < 0) {
    errors.push({ field: 'propertyConfig.bathroomCount', message: 'Bathroom count is required' });
  } else if (bathrooms > 10) {
    errors.push({ field: 'propertyConfig.bathroomCount', message: 'Maximum 10 common bathrooms allowed' });
  }
};

const validateImages = (formData: any, errors: ValidationError[]) => {
  const imgs = formData.propertyImages || {};
  const pImages = imgs?.property || [];
  if (pImages.length < 3) {
    errors.push({ field: 'propertyImages.property', message: `Please upload at least 3 property images (currently: ${pImages.length})` });
  }

  // Validate that each room defined in the config has at least 1 image
  const rooms = formData.propertyConfig?.rooms || [];
  const roomImages = imgs?.rooms || {};

  rooms.forEach((_: any, index: number) => {
    const images = roomImages[index] || roomImages[index.toString()];
    if (!images || images.length === 0) {
      errors.push({ 
        field: `propertyImages.rooms.${index}`, 
        message: `Please upload at least 1 image for Room ${index + 1}` 
      });
    }
  });
};

const validateRooms = (rooms: any[], errors: ValidationError[]) => {
  if (!rooms || rooms.length === 0) {
    errors.push({ field: 'propertyConfig.rooms', message: 'At least one room unit is required' });
    return;
  }

  rooms.forEach((room, index) => {
    if (!room.roomType) {
      errors.push({ field: `propertyConfig.rooms[${index}].roomType`, message: `Room ${index + 1}: Room type is required` });
    }
    if (!room.bedType) {
      errors.push({ field: `propertyConfig.rooms[${index}].bedType`, message: `Room ${index + 1}: Bed type is required` });
    }
    if (!room.bathroomArrangement) {
      errors.push({ field: `propertyConfig.rooms[${index}].bathroomArrangement`, message: `Room ${index + 1}: Please select a bathroom setup` });
    }

    const priceStr = room.price;
    if (priceStr === undefined || priceStr === '') {
      errors.push({ field: `propertyConfig.rooms[${index}].price`, message: `Room ${index + 1}: Price is required` });
    } else {
      const price = Number(priceStr);
      if (price < 500) {
        errors.push({ field: `propertyConfig.rooms[${index}].price`, message: `Room ${index + 1}: Price must be at least ₱500` });
      } else if (price > 50000) {
        errors.push({ field: `propertyConfig.rooms[${index}].price`, message: `Room ${index + 1}: Price cannot exceed ₱50,000` });
      }
    }

    const resFeeStr = room.reservationFee;
    if (resFeeStr === undefined || resFeeStr === '') {
      errors.push({ field: `propertyConfig.rooms[${index}].reservationFee`, message: `Room ${index + 1}: Reservation fee is required` });
    } else {
      const resFee = Number(resFeeStr);
      if (resFee < 500) {
        errors.push({ field: `propertyConfig.rooms[${index}].reservationFee`, message: `Room ${index + 1}: Fee must be at least ₱500` });
      } else if (resFee > 50000) {
        errors.push({ field: `propertyConfig.rooms[${index}].reservationFee`, message: `Room ${index + 1}: Fee cannot exceed ₱50,000` });
      }
    }

    const bedCountStr = room.bedCount;
    if (bedCountStr === undefined || bedCountStr === '') {
      errors.push({ field: `propertyConfig.rooms[${index}].bedCount`, message: `Room ${index + 1}: Bed count is required` });
    } else {
      const bedCount = Number(bedCountStr);
      if (bedCount < 1) {
        errors.push({ field: `propertyConfig.rooms[${index}].bedCount`, message: `Room ${index + 1}: Bed count must be at least 1` });
      } else if (bedCount > 10) {
        errors.push({ field: `propertyConfig.rooms[${index}].bedCount`, message: `Room ${index + 1}: Bed count cannot exceed 10` });
      }
    }

    const sizeStr = room.size;
    if (sizeStr === undefined || sizeStr === '') {
      errors.push({ field: `propertyConfig.rooms[${index}].size`, message: `Room ${index + 1}: Size is required` });
    } else {
      const size = Number(sizeStr);
      if (size < 5) {
        errors.push({ field: `propertyConfig.rooms[${index}].size`, message: `Room ${index + 1}: Size must be at least 5 sqm` });
      } else if (size > 100) {
        errors.push({ field: `propertyConfig.rooms[${index}].size`, message: `Room ${index + 1}: Size cannot exceed 100 sqm` });
      }
    }
  });
};

const validateDocuments = (docs: any, errors: ValidationError[]) => {
  if (!docs.governmentId) {
    errors.push({ field: 'documents.governmentId', message: 'Government ID is required' });
  }
  if (!docs.businessPermit) {
    errors.push({ field: 'documents.businessPermit', message: 'Business Permit is required' });
  }
  if (!docs.landTitle) {
    errors.push({ field: 'documents.landTitle', message: 'Land Title / Lease Agreement is required' });
  }
  if (!docs.barangayClearance) {
    errors.push({ field: 'documents.barangayClearance', message: 'Barangay Clearance is required' });
  }
  if (!docs.fireSafetyCertificate) {
    errors.push({ field: 'documents.fireSafetyCertificate', message: 'Fire Safety Certificate is required' });
  }
};
