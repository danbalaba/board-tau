import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhoneNumber,
  validateOTP,
  sanitizeInput,
  validateLoginForm,
  validateSignupForm,
  validateChangePasswordForm
} from '../validators';

describe('validators.ts', () => {
  describe('validateEmail', () => {
    it('returns error if empty', () => expect(validateEmail('')).toBe('Email is required'));
    it('returns error if invalid', () => expect(validateEmail('invalid-email')).toBe('Please enter a valid email address'));
    it('returns error if too long', () => expect(validateEmail('a'.repeat(250) + '@example.com')).toBe('Email must be less than 255 characters'));
    it('returns null if valid', () => expect(validateEmail('test@example.com')).toBeNull());
  });

  describe('validatePassword', () => {
    it('returns error if empty', () => expect(validatePassword('')).toBe('Password is required'));
    it('returns error if too short', () => expect(validatePassword('Abc1!')).toBe('Password must be at least 8 characters'));
    it('returns error if too long', () => expect(validatePassword('Abc1!'.repeat(25))).toBe('Password must be less than 100 characters'));
    it('returns error if no uppercase', () => expect(validatePassword('abcdefg1!')).toBe('Password must contain at least one uppercase letter'));
    it('returns error if no lowercase', () => expect(validatePassword('ABCDEFG1!')).toBe('Password must contain at least one lowercase letter'));
    it('returns error if no number', () => expect(validatePassword('Abcdefg!')).toBe('Password must contain at least one number'));
    it('returns error if no special char', () => expect(validatePassword('Abcdefg12')).toBe('Password must contain at least one special character'));
    it('returns null if valid', () => expect(validatePassword('ValidPass123!')).toBeNull());
  });

  describe('validateName', () => {
    it('returns error if empty', () => expect(validateName('')).toBe('Name is required'));
    it('returns error if too short', () => expect(validateName('A')).toBe('Name must be at least 2 characters'));
    it('returns error if too long', () => expect(validateName('A'.repeat(101))).toBe('Name must be less than 100 characters'));
    it('returns error if contains invalid chars', () => expect(validateName('John D@e')).toBe('Name can only contain letters, spaces, hyphens, and apostrophes'));
    it('returns null if valid', () => expect(validateName('John Doe')).toBeNull());
    it('returns null if valid with apostrophe and hyphen', () => expect(validateName("O'Brian-Smith")).toBeNull());
  });

  describe('validatePhoneNumber', () => {
    it('returns error if empty', () => expect(validatePhoneNumber('')).toBe('Phone number is required'));
    it('returns null for valid 09 format', () => expect(validatePhoneNumber('09171234567')).toBeNull());
    it('returns null for valid +639 format', () => expect(validatePhoneNumber('+63 917 123 4567')).toBeNull());
    it('returns error if invalid length', () => expect(validatePhoneNumber('0917123456')).toBe('Please enter a valid Philippine mobile number (e.g., 0917 123 4567 or +63 917 123 4567)'));
    it('returns error if not starting with valid prefix', () => expect(validatePhoneNumber('08171234567')).toBe('Please enter a valid Philippine mobile number (e.g., 0917 123 4567 or +63 917 123 4567)'));
  });

  describe('validateOTP', () => {
    it('returns error if empty', () => expect(validateOTP('')).toBe('OTP is required'));
    it('returns error if invalid length', () => expect(validateOTP('12345')).toBe('OTP must be exactly 6 digits'));
    it('returns error if non-digits', () => expect(validateOTP('123a56')).toBe('OTP must be exactly 6 digits'));
    it('returns null if valid', () => expect(validateOTP('123456')).toBeNull());
  });

  describe('sanitizeInput', () => {
    it('returns empty if falsy', () => expect(sanitizeInput('')).toBe(''));
    it('trims whitespace', () => expect(sanitizeInput(' test ')).toBe('test'));
    it('escapes HTML entities', () => expect(sanitizeInput('<script>')).toBe('&lt;script&gt;'));
  });

  describe('validateLoginForm', () => {
    it('returns errors for invalid fields', () => {
      const errors = validateLoginForm('invalid', '');
      expect(errors.email).toBeDefined();
      expect(errors.password).toBe('Password is required');
    });
    it('returns empty object for valid fields', () => {
      expect(validateLoginForm('test@example.com', 'Valid123!')).toEqual({});
    });
  });

  describe('validateSignupForm', () => {
    it('returns errors for invalid fields', () => {
      const errors = validateSignupForm('A', 'invalid', 'weak');
      expect(errors.name).toBe('Name must be at least 2 characters');
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    });
    it('returns empty object for valid fields', () => {
      expect(validateSignupForm('John', 'test@example.com', 'Valid123!')).toEqual({});
    });
  });

  describe('validateChangePasswordForm', () => {
    it('returns error for empty old password', () => {
      const errors = validateChangePasswordForm('', 'Valid123!', 'Valid123!');
      expect(errors.oldPassword).toBe('Current password is required');
    });
    it('returns error for invalid new password', () => {
      const errors = validateChangePasswordForm('oldPass1!', 'weak', 'weak');
      expect(errors.newPassword).toBeDefined();
    });
    it('returns error for empty confirm password', () => {
      const errors = validateChangePasswordForm('oldPass1!', 'Valid123!', '');
      expect(errors.confirmPassword).toBe('Confirm password is required');
    });
    it('returns error for mismatching passwords', () => {
      const errors = validateChangePasswordForm('oldPass1!', 'Valid123!', 'Valid123@');
      expect(errors.confirmPassword).toBe('Passwords do not match');
    });
    it('returns empty object for valid inputs', () => {
      expect(validateChangePasswordForm('oldPass1!', 'Valid123!', 'Valid123!')).toEqual({});
    });
  });
});
