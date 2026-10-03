import React from "react";
import { MessageSquare, Sparkles, ShieldCheck, Tag } from "lucide-react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormData } from "../useInquiryLogic";
import { isCleanString, sanitizeSecurityString } from "../validation/security";

interface NoteStepProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  watch?: UseFormWatch<FormData>;
  setValue?: UseFormSetValue<FormData>;
}

const QUICK_TAGS = [
  "Lower Bunk Bed",
  "Quiet Area / Study Desk",
  "Late Check-in",
  "Near Window / Balcony",
  "Baggage Storage Space",
  "Non-Smoking Room",
];

const NoteStep: React.FC<NoteStepProps> = ({ register, errors, watch, setValue }) => {
  const currentMessage = watch ? (watch('message') || '') : '';

  const handleAddTag = (tag: string) => {
    if (!setValue) return;
    const existing = currentMessage.trim();
    if (!existing) {
      setValue('message', tag, { shouldValidate: true, shouldDirty: true });
    } else if (!existing.includes(tag)) {
      setValue('message', `${existing}, ${tag}`, { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 flex-wrap">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <MessageSquare size={18} />
            </div>
            <span>Step 3: Special Request</span>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">(Optional)</span>
          </h3>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
          Direct Host Note
        </span>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
          Do you have any special preferences or questions for the host?
        </label>

        {/* Quick-Fill Suggestion Tags */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            <Sparkles size={12} className="text-amber-500" />
            Quick-Add Preferences:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS.map((tag) => {
              const isSelected = currentMessage.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all duration-200 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <Tag size={12} className={isSelected ? 'text-primary' : 'text-gray-400'} />
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Textarea Box */}
        <div className="relative">
          <textarea
            rows={5}
            maxLength={500}
            {...register('message', {
              validate: {
                noXss: (value) => !value || isCleanString(value) || "Special characters like (< > { } [ ]) are not allowed for security reasons.",
                noSql: (value) => {
                  if (!value) return true;
                  const sanitized = sanitizeSecurityString(value);
                  return true;
                },
                secureContent: (value) => {
                  if (!value) return true;
                  const sqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC)\b/gi;
                  if (sqlKeywords.test(value)) return "Input contains restricted keywords for security.";
                  return true;
                }
              }
            })}
            className={`w-full p-4 bg-white dark:bg-gray-900 border rounded-2xl outline-none transition-all text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ${
              errors.message
                ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20'
            }`}
            placeholder="e.g., I'd like to request a lower bunk bed, or I will be arriving late for check-in on my first day..."
          />

          <div className="flex items-center justify-between mt-1 px-1">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 italic flex items-center gap-1">
              <ShieldCheck size={12} className="text-primary" />
              Input is automatically sanitized for security
            </span>
            <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
              {currentMessage.length} / 500
            </span>
          </div>
        </div>

        {errors.message && (
          <p className="text-xs text-red-500 font-bold animate-in fade-in">{errors.message.message}</p>
        )}
      </div>
    </div>
  );
};

export default NoteStep;

