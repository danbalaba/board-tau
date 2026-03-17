import { FieldPath, FieldValues } from 'react-hook-form';

export interface BaseFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: any;
  name: TName;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface FormOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxGroupOption extends FormOption {
  icon?: React.ReactNode;
}

export interface RadioGroupOption extends FormOption {
  icon?: React.ReactNode;
}

export interface DatePickerConfig {
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  placeholder?: string;
}

export interface FileUploadConfig {
  maxSize?: number;
  multiple?: boolean;
  acceptedTypes?: string[];
  maxFiles?: number;
  onUpload?: (files: File[]) => Promise<void>;
  progresses?: any;
}

export interface SliderConfig {
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
}

export interface TextareaConfig {
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  resize?: 'vertical' | 'horizontal' | 'none';
}
