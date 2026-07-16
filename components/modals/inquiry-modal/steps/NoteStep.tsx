import React from "react";
import { FaComment } from "react-icons/fa";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FormData } from "../useInquiryLogic";
import { isCleanString, sanitizeSecurityString } from "../validation/security";

interface NoteStepProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

const NoteStep: React.FC<NoteStepProps> = ({ register, errors }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100">
        <FaComment className="inline mr-2" />
        3. Special Request <span className="text-sm font-normal text-gray-500">(Optional)</span>
      </h3>
      <div>
        <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
          Do you have any special requests or preferences for the host?
        </label>
        <textarea
          rows={5}
          {...register('message', { 
            validate: {
              noXss: (value) => isCleanString(value) || "Special characters like (< > { } [ ]) are not allowed for security reasons.",
              noSql: (value) => {
                const sanitized = sanitizeSecurityString(value);
                if (sanitized.length < value.length) {
                   // This means some keywords were stripped
                }
                return true; 
              },
              secureContent: (value) => {
                const sqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND|EXEC)\b/gi;
                if (sqlKeywords.test(value)) return "Input contains restricted keywords for security.";
                return true;
              }
            }
          })}
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-primary dark:focus:border-primary bg-white dark:bg-gray-900 text-text-primary dark:text-gray-100"
          placeholder="e.g., I'd like to request a lower bunk bed, or I will be arriving late for check-in..."
        />
        {errors.message && (
          <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
        )}
      </div>
    </div>
  );
};

export default NoteStep;
