"use client";
import React, { useState } from "react";
import Modal from "./Modal";
import Button from "@/components/common/Button";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaCheck, FaTimes, FaHeart, FaBan } from "react-icons/fa";
import { stayDurationOptions } from "@/utils/constants";

interface Room {
  id: string;
  name: string;
  price: number;
  capacity: number;
  availableSlots: number;
  images: string[];
  roomType: string;
  status: string;
}

interface InquiryModalProps {
  listingName: string;
  rooms: Room[];
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const InquiryModal: React.FC<InquiryModalProps> = ({
  listingName,
  rooms,
  onSubmit,
  isLoading,
}) => {
  const [step, setStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [formData, setFormData] = useState({
    moveInDate: "",
    stayDuration: "",
    occupantsCount: 1,
    role: "",
    hasPets: false,
    smokes: false,
    contactMethod: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // Step 1 handlers
  const handleSwipeLeft = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (currentRoomIndex < rooms.length - 1) {
      setCurrentRoomIndex((prev) => prev + 1);
    }
  };

  const handleSwipeRight = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedRoom(rooms[currentRoomIndex]);
    setStep(2);
  };

  // Step 2 handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as any;
    const { name, value, type, checked } = target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" || type === "radio" ? checked : value,
    }));
  };

  const handleOccupantsChange = (value: number) => {
    setFormData((prev) => ({ ...prev, occupantsCount: value }));
  };

  // Step 3 handlers
  const handleSubmit = async () => {
    if (!selectedRoom) {
      return;
    }

    try {
      const data = {
        ...formData,
        roomId: selectedRoom.id,
        listingName,
      };
      await onSubmit(data);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
    }
  };

  // Filter available rooms
  const availableRooms = rooms.filter((room) => room.status === "available");

  return (
      <Modal.Window name="inquiry">
        <div>
          <Modal.WindowHeader title={submitted ? "Inquiry Sent!" : "Inquire About This Listing"} />
          <div className="p-6">
            {/* Step 1: Room Selection */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="min-h-[400px]"
              >
                <h3 className="text-lg font-semibold mb-4 text-text-primary dark:text-gray-100">
                  Select a Room
                </h3>

                {availableRooms.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">
                      No rooms available for this listing
                    </p>
                    <Modal.Trigger name="inquiry">
                      <Button>Close</Button>
                    </Modal.Trigger>
                  </div>
                ) : (
                  <div className="relative h-[400px]">
                    {/* Tinder-style card */}
                    <motion.div
                      key={currentRoomIndex}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        {/* Room Image */}
                        <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 relative">
                          <img
                            src={availableRooms[currentRoomIndex].images[0] || "/images/placeholder.jpg"}
                            alt={availableRooms[currentRoomIndex].name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 right-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                availableRooms[currentRoomIndex].status === "available"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}
                            >
                              {availableRooms[currentRoomIndex].status}
                            </span>
                          </div>
                        </div>

                        {/* Room Info */}
                        <div className="p-6">
                          <h4 className="text-2xl font-bold text-text-primary dark:text-gray-100 mb-2">
                            {availableRooms[currentRoomIndex].name}
                          </h4>
                          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                            ₱ {availableRooms[currentRoomIndex].price.toLocaleString()}/month
                          </p>
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Capacity</p>
                              <p className="font-semibold text-text-primary dark:text-gray-100">
                                {availableRooms[currentRoomIndex].capacity} {availableRooms[currentRoomIndex].capacity === 1 ? "person" : "people"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Available Slots</p>
                              <p className="font-semibold text-text-primary dark:text-gray-100">
                                {availableRooms[currentRoomIndex].availableSlots}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Room Type</p>
                              <p className="font-semibold text-text-primary dark:text-gray-100">
                                {availableRooms[currentRoomIndex].roomType}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Price Range</p>
                              <p className="font-semibold text-text-primary dark:text-gray-100">
                                {availableRooms[currentRoomIndex].price.toLocaleString()}/month
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Swipe buttons */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-6 pb-6">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleSwipeLeft(e)}
                        disabled={currentRoomIndex === 0}
                        className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
                      >
                        <FaBan size={24} className="text-red-500" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleSwipeRight(e)}
                        className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center border border-gray-200 dark:border-gray-700"
                      >
                        <FaHeart size={24} className="text-green-500" />
                      </motion.button>
                    </div>

                    {/* Room indicator */}
                    <div className="absolute top-4 left-0 right-0 flex justify-center gap-2">
                      {availableRooms.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentRoomIndex ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Inquiry Details */}
            {step === 2 && selectedRoom && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100">
                  Inquiry Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Move-in Date */}
                  <div>
                    <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
                      Move-in Date
                    </label>
                    <input
                      type="month"
                      name="moveInDate"
                      value={formData.moveInDate}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-text-primary dark:text-gray-100"
                    />
                  </div>

                  {/* Stay Duration */}
                  <div>
                    <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
                      Stay Duration
                    </label>
                    <select
                      name="stayDuration"
                      value={formData.stayDuration}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-text-primary dark:text-gray-100"
                    >
                      <option value="">Select duration...</option>
                      {stayDurationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Occupants Count */}
                  <div>
                    <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
                      Number of Occupants
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleOccupantsChange(Math.max(1, formData.occupantsCount - 1))
                        }
                        disabled={formData.occupantsCount <= 1}
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaChevronLeft size={12} />
                      </button>
                      <span className="text-lg font-semibold min-w-[40px] text-center">
                        {formData.occupantsCount}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleOccupantsChange(Math.min(selectedRoom.capacity, formData.occupantsCount + 1))
                        }
                        disabled={formData.occupantsCount >= selectedRoom.capacity}
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaChevronRight size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-text-primary dark:text-gray-100"
                    >
                      <option value="">Select role...</option>
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Pets */}
                  <div>
                    <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
                      Pets?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="hasPets"
                          value="true"
                          checked={formData.hasPets}
                          onChange={() =>
                            setFormData((prev) => ({ ...prev, hasPets: true }))
                          }
                          className="accent-blue-500"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="hasPets"
                          value="false"
                          checked={!formData.hasPets}
                          onChange={() =>
                            setFormData((prev) => ({ ...prev, hasPets: false }))
                          }
                          className="accent-blue-500"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  {/* Smoke */}
                  <div>
                    <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
                      Smoke?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="smokes"
                          value="true"
                          checked={formData.smokes}
                          onChange={() =>
                            setFormData((prev) => ({ ...prev, smokes: true }))
                          }
                          className="accent-blue-500"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="smokes"
                          value="false"
                          checked={!formData.smokes}
                          onChange={() =>
                            setFormData((prev) => ({ ...prev, smokes: false }))
                          }
                          className="accent-blue-500"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  {/* Contact Method */}
                  <div>
                    <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
                      Preferred Contact Method
                    </label>
                    <select
                      name="contactMethod"
                      value={formData.contactMethod}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-text-primary dark:text-gray-100"
                    >
                      <option value="">Select method...</option>
                      <option value="chat">Chat</option>
                      <option value="phone">Phone</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
                    Message to Owner (Optional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-text-primary dark:text-gray-100"
                    placeholder="Add any additional information or questions..."
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button onClick={() => setStep(1)} outline>
                    <FaChevronLeft /> Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={
                      !formData.moveInDate ||
                      !formData.stayDuration ||
                      !formData.role ||
                      !formData.contactMethod
                    }
                  >
                    Next <FaChevronRight />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review and Confirm */}
            {step === 3 && selectedRoom && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100">
                  Review Your Inquiry
                </h3>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  {/* Listing Info */}
                  <div className="mb-6">
                    <h4 className="text-xl font-bold mb-2 text-text-primary dark:text-gray-100">
                      {listingName}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>Room: {selectedRoom.name}</span>
                      <span>₱ {selectedRoom.price.toLocaleString()}/month</span>
                    </div>
                  </div>

                  {/* Room Image */}
                  {selectedRoom.images.length > 0 && (
                    <div className="mb-6">
                      <img
                        src={selectedRoom.images[0] || "/images/placeholder.jpg"}
                        alt={selectedRoom.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Inquiry Details */}
                  <div className="mb-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Move-in Date:</span>
                      <span className="font-semibold text-text-primary dark:text-gray-100">
                        {formData.moveInDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Stay Duration:</span>
                      <span className="font-semibold text-text-primary dark:text-gray-100">
                        {stayDurationOptions.find((o) => o.value === formData.stayDuration)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Occupants:</span>
                      <span className="font-semibold text-text-primary dark:text-gray-100">
                        {formData.occupantsCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Role:</span>
                      <span className="font-semibold text-text-primary dark:text-gray-100">
                        {formData.role}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Pets:</span>
                      <span className="font-semibold text-text-primary dark:text-gray-100">
                        {formData.hasPets ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Smoke:</span>
                      <span className="font-semibold text-text-primary dark:text-gray-100">
                        {formData.smokes ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Contact Method:</span>
                      <span className="font-semibold text-text-primary dark:text-gray-100">
                        {formData.contactMethod}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  {formData.message && (
                    <div className="mb-6">
                      <h5 className="font-semibold mb-2 text-text-primary dark:text-gray-100">Message:</h5>
                      <p className="text-gray-600 dark:text-gray-400">{formData.message}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Button onClick={() => setStep(2)} outline>
                    <FaChevronLeft /> Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? "Sending..." : "Send Inquiry"}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheck size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-text-primary dark:text-gray-100">
                  Inquiry Sent!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Your inquiry has been sent successfully. We'll notify you once the owner approves it.
                </p>
                <Modal.Trigger name="inquiry">
                  <Button>Close</Button>
                </Modal.Trigger>
              </motion.div>
            )}
          </div>
        </div>
      </Modal.Window>
  );
};

export default InquiryModal;
