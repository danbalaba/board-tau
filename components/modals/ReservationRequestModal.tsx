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

interface ReservationRequestModalProps {
  listingName: string;
  room: Room;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const ReservationRequestModal: React.FC<ReservationRequestModalProps> = ({
  listingName,
  room,
  onSubmit,
  isLoading,
}) => {
  const [step, setStep] = useState(1);
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
    try {
      const data = {
        ...formData,
        roomId: room.id,
        listingName,
      };
      await onSubmit(data);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting reservation request:", error);
    }
  };

  return (
      <Modal.Window name={`reserve-${room.id}`}>
        <div>
          <Modal.WindowHeader title={submitted ? "Reservation Request Sent!" : "Reservation Request"} />
          <div className="p-6">
            {/* Step 1: Reservation Details (formerly Step 2) */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100">
                  Reservation Details
                </h3>

                {/* Selected Room Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <img
                        src={room.images[0] || "/images/placeholder.jpg"}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-text-primary dark:text-gray-100">
                        {room.name}
                      </h4>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold">
                        ₱ {room.price.toLocaleString()}/month
                      </p>
                    </div>
                  </div>
                </div>

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
                          handleOccupantsChange(Math.min(room.capacity, formData.occupantsCount + 1))
                        }
                        disabled={formData.occupantsCount >= room.capacity}
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

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setStep(2)}
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

            {/* Step 2: Review and Confirm (formerly Step 3) */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100">
                  Review Your Reservation Request
                </h3>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  {/* Listing Info */}
                  <div className="mb-6">
                    <h4 className="text-xl font-bold mb-2 text-text-primary dark:text-gray-100">
                      {listingName}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>Room: {room.name}</span>
                      <span>₱ {room.price.toLocaleString()}/month</span>
                    </div>
                  </div>

                  {/* Room Image */}
                  {room.images.length > 0 && (
                    <div className="mb-6">
                      <img
                        src={room.images[0] || "/images/placeholder.jpg"}
                        alt={room.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Reservation Details */}
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
                      <span className="text-gray-600 dark:text-gray-400">Number of Occupants:</span>
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
                    {formData.message && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Message:</span>
                        <span className="font-semibold text-text-primary dark:text-gray-100">
                          {formData.message}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button onClick={() => setStep(1)} outline>
                    <FaChevronLeft /> Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Request"}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Submitted Success State */}
            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheck size={48} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary dark:text-gray-100 mb-4">
                  Reservation Request Sent!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your reservation request has been sent to the owner.
                  You will receive a confirmation email once it is approved.
                </p>
                <Modal.Trigger name={`reserve-${room.id}`}>
                  <Button>Close</Button>
                </Modal.Trigger>
              </motion.div>
            )}
          </div>
        </div>
      </Modal.Window>
  );
};

export default ReservationRequestModal;
