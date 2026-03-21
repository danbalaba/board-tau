"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import Button from "@/components/common/Button";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaCheck } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface Room {
  id: string;
  name: string;
  price: number;
  capacity: number;
  availableSlots: number;
  images: {
    id: string;
    url: string;
    caption?: string;
    order?: number;
  }[];
  roomType: string;
  status: string;
}

interface InquiryModalProps {
  listingName: string;
  room: Room;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const InquiryModal: React.FC<InquiryModalProps> = ({
  listingName,
  room,
  onSubmit,
  isLoading,
}) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  // Image slider handlers
  const handleImagePrev = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? (room.images?.length - 1 || 0) : prev - 1
    );
  };

  const handleImageNext = () => {
    setCurrentImageIndex((prev) => 
      prev === (room.images?.length - 1 || 0) ? 0 : prev + 1
    );
  };

  const handleImageSelect = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Calculate total price
  const totalPrice = formData.stayDuration ? room.price * parseInt(formData.stayDuration) : 0;

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
      // Redirect to My Reservations page after a short delay
      setTimeout(() => {
        router.push("/reservations");
      }, 1500);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
    }
  };

  return (
      <Modal.Window name={`inquire-${room.id}`} size="xl">
        <div>
          <Modal.WindowHeader title={submitted ? "Reservation Created!" : "Reserve Room"} />
          <div className="p-6">
            {/* Step 1: Inquiry Details */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Room Image Slider */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <div className="aspect-[4/3] w-full overflow-hidden">
                      <img
                        src={(room.images && room.images.length > 0) ? room.images[currentImageIndex].url : "/images/placeholder.jpg"}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Slider Controls */}
                    {(room.images && room.images.length > 1) && (
                      <>
                        <button
                          onClick={handleImagePrev}
                          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                        >
                          <FaChevronLeft size={20} />
                        </button>
                        <button
                          onClick={handleImageNext}
                          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                        >
                          <FaChevronRight size={20} />
                        </button>
                        {/* Image Indicators */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {room.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => handleImageSelect(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                currentImageIndex === index ? "bg-white" : "bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Inquiry Form */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100">
                    Reservation Details
                  </h3>

                  {/* Selected Room Info */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="text-lg font-bold text-text-primary dark:text-gray-100">
                        {room.name}
                      </h4>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold">
                        ₱ {room.price.toLocaleString()}/month
                      </p>
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
                        Stay Duration (months)
                      </label>
                      <select
                        name="stayDuration"
                        value={formData.stayDuration}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-text-primary dark:text-gray-100"
                      >
                        <option value="">Select duration...</option>
                        {[1, 2, 3, 6, 12].map((months) => (
                          <option key={months} value={months}>
                            {months} month{months > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Total Price */}
                    <div>
                      <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
                        Total Price
                      </label>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ₱ {totalPrice.toLocaleString()}
                      </p>
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
                      onClick={handleSubmit}
                      disabled={
                        !formData.moveInDate ||
                        !formData.stayDuration ||
                        !formData.role ||
                        !formData.contactMethod
                      }
                    >
                      Confirm Reservation
                    </Button>
                  </div>
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
                  Reservation Created!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your reservation has been created successfully!
                  You will be redirected to your reservations page.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </Modal.Window>
  );
};

export default InquiryModal;
