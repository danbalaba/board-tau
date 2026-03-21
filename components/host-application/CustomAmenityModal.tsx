import React, { useState, useContext } from 'react';
import Input from '../inputs/Input';
import Button from '../common/Button';
import Modal from '../modals/Modal';
import { ModalContext } from '../modals/Modal';

interface CustomAmenityModalProps {
  setValue: any;
  getValues: any;
  selectedRoomIndex: number;
}

const CustomAmenityModal: React.FC<CustomAmenityModalProps> = ({
  setValue,
  getValues,
  selectedRoomIndex
}) => {
  const [customAmenityText, setCustomAmenityText] = useState('');
  const { close } = useContext(ModalContext);

  const handleCustomAmenitySubmit = () => {
    if (customAmenityText.trim() && selectedRoomIndex !== -1) {
      const currentRooms = getValues('propertyConfig.rooms');
      const updatedRooms = [...currentRooms];
      const customAmenity = customAmenityText.trim().toUpperCase().replace(/\s+/g, '_');

      if (!updatedRooms[selectedRoomIndex].amenities.includes(customAmenity)) {
        updatedRooms[selectedRoomIndex].amenities.push(customAmenity);
        setValue('propertyConfig.rooms', updatedRooms); // Update the form state
      }

      close(); // Close the modal using context API
    }
  };

  return (
    <div className="space-y-4">
      <Modal.WindowHeader title="Add Custom Amenity" />
      <div className="p-6">
        <Input
          label="Amenity Name"
          id="customAmenity"
          type="text"
          value={customAmenityText}
          onChange={(e) => setCustomAmenityText(e.target.value)}
          placeholder="e.g., Smart TV, Microwave"
          required
        />
        <div className="flex space-x-2 justify-end mt-4">
          <Button
            type="button"
            outline
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCustomAmenitySubmit}
            disabled={!customAmenityText.trim()}
          >
            Add Amenity
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomAmenityModal;
