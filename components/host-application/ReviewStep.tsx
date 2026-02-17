import React from 'react';

interface ReviewStepProps {
  watch: any;
  onBack: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ watch, onBack }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Your Application</h3>
        <p className="text-gray-600">Please review all the information before submitting. You can edit any section by clicking Previous.</p>
      </div>

      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Your Information</h4>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Full Name</label>
              <p className="text-gray-900">{watch('contactInfo.fullName')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Phone Number</label>
              <p className="text-gray-900">{watch('contactInfo.phoneNumber')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-900">{watch('contactInfo.email')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Emergency Contact</label>
              <p className="text-gray-900">{watch('contactInfo.emergencyContact.name')} ({watch('contactInfo.emergencyContact.relationship')})</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Property Information</h4>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Business Name</label>
              <p className="text-gray-900">{watch('businessInfo.businessName')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Property Name</label>
              <p className="text-gray-900">{watch('propertyInfo.propertyName')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Business Type</label>
              <p className="text-gray-900">{watch('businessInfo.businessType')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Category</label>
              <p className="text-gray-900">{watch('propertyInfo.category')}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600">Description</label>
              <p className="text-gray-900">{watch('propertyInfo.description')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Location</h4>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Address</label>
              <p className="text-gray-900">{watch('location.address')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">City</label>
              <p className="text-gray-900">{watch('location.city')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Province</label>
              <p className="text-gray-900">{watch('location.province')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Zip Code</label>
              <p className="text-gray-900">{watch('location.zipCode')}</p>
            </div>
          </div>
        </div>
      </div>

       <div className="bg-gray-50 rounded-lg overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Property Configuration</h4>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Total Rooms</label>
              <p className="text-gray-900">{watch('propertyConfig.totalRooms')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Bathrooms</label>
              <p className="text-gray-900">{watch('propertyConfig.bathroomCount')} ({watch('propertyConfig.bathroomType')})</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600">Rules & Preferences</label>
              <p className="text-gray-900">
                {watch('propertyConfig.femaleOnly') && 'Female-only, '}
                {watch('propertyConfig.maleOnly') && 'Male-only, '}
                {watch('propertyConfig.visitorsAllowed') && 'Visitors allowed, '}
                {watch('propertyConfig.petsAllowed') && 'Pets allowed, '}
                {watch('propertyConfig.smokingAllowed') && 'Smoking allowed'}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600">Advanced Features</label>
              <p className="text-gray-900">
                {watch('propertyConfig.security24h') && '24/7 security, '}
                {watch('propertyConfig.cctv') && 'CCTV, '}
                {watch('propertyConfig.fireSafety') && 'Fire safety equipment, '}
                {watch('propertyConfig.nearTransport') && 'Near public transport, '}
                {watch('propertyConfig.studyFriendly') && 'Study-friendly environment, '}
                {watch('propertyConfig.quietEnvironment') && 'Quiet / noise-controlled, '}
                {watch('propertyConfig.flexibleLease') && 'Flexible lease terms'}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600">Amenities</label>
              <p className="text-gray-900">{watch('propertyConfig.amenities').join(', ')}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600">House Rules</label>
              <p className="text-gray-900">{watch('propertyConfig.rules').join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
