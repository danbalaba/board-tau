import React from "react";
import { FaComment } from "react-icons/fa";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FormData } from "../useInquiryLogic";

interface NoteStepProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

const NoteStep: React.FC<NoteStepProps> = ({ register, errors }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100">
        <FaComment className="inline mr-2" />
        3. Message to Host
        <span className="text-red-500 ml-1">*</span>
      </h3>
      <div>
        <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
          Tell the host about yourself and why you're interested in this room
        </label>
        <textarea
          rows={5}
          {...register('message', { 
            required: "Message is required",
            minLength: {
              value: 10,
              message: "Message must be at least 10 characters long.",
            },
            validate: {
              noXss: (value) => !/[<>]/.test(value) || "Special characters like (< >) are not allowed for security reasons.",
              noSql: (value) => !/(\b(SELECT|UPDATE|DELETE|INSERT|DROP|ALTER|EXEC|UNION)\b)/i.test(value) || "Invalid input detected for security reasons."
            }
          })}
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-primary dark:focus:border-primary bg-white dark:bg-gray-900 text-text-primary dark:text-gray-100"
          placeholder="Hello! I'm a [student/staff] at TAU looking for a place near the university. Please let me know if this is available..."
        />
        {errors.message && (
          <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
        )}
      </div>
    </div>
  );
};

export default NoteStep;
