import validator from 'validator';

// Email validation
export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (!validator.isEmail(email)) return 'Please enter a valid email address';
  if (email.length > 255) return 'Email must be less than 255 characters';
  return null;
};

// Password validation
export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 100) return 'Password must be less than 100 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
  return null;
};

// Name validation
export const validateName = (name: string): string | null => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (name.length > 100) return 'Name must be less than 100 characters';
  if (!/^[a-zA-Z\s'-]+$/.test(name)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  return null;
};

// Phone number validation (Philippine format)
export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone) return 'Phone number is required';

  // Remove all non-digit characters
  const cleaned = phone.replace(/[^0-9]/g, '');

  // Validate length and format for Philippine mobile numbers
  // Accepts: 09xx xxx xxxx, +63 9xx xxx xxxx, 639xx xxx xxxx, etc.
  if (cleaned.length >= 10 && cleaned.length <= 13) {
    // Check if it's a valid Philippine mobile number
    if (/^(09|9|639)\d{9}$/.test(cleaned)) {
      return null; // Valid
    }
  }

  return 'Please enter a valid Philippine mobile number (e.g., 0917 123 4567 or +63 917 123 4567)';
};

// OTP validation
export const validateOTP = (otp: string): string | null => {
  if (!otp) return 'OTP is required';
  if (!/^\d{6}$/.test(otp)) return 'OTP must be exactly 6 digits';
  return null;
};

// Sanitization function to prevent XSS
export const sanitizeInput = (input: string): string => {
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  // Trim whitespace
  sanitized = sanitized.trim();
  // Remove potentially malicious characters
  sanitized = validator.escape(sanitized);
  return sanitized;
};

// Validate all login form fields
export const validateLoginForm = (email: string, password: string): Record<string, string> => {
  const errors: Record<string, string> = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;

  return errors;
};

// Validate all signup form fields
export const validateSignupForm = (name: string, email: string, password: string): Record<string, string> => {
  const errors: Record<string, string> = {};
  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (nameError) errors.name = nameError;
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;

  return errors;
};

// Validate change password form fields
export const validateChangePasswordForm = (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!currentPassword) {
    errors.currentPassword = 'Current password is required';
  }

  const newPasswordError = validatePassword(newPassword);
  if (newPasswordError) {
    errors.newPassword = newPasswordError;
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm password is required';
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'New password and confirm password do not match';
  }

  return errors;
};
