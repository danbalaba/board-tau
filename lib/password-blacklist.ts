/**
 * A curated list of the most commonly used/compromised passwords.
 * These are rejected during signup to prevent weak accounts.
 */
export const FORBIDDEN_PASSWORDS = [
  'password', 'password123', '12345678', '123456789', '12345', '123456',
  'qwerty', 'admin', 'welcome', 'login', 'pass123', 'pass@word',
  'letmein', 'account', 'secret', 'password!', 'p@ssword', 'user123',
  '111111', '666666', '888888', '123123', '000000', '121212',
  'football', 'soccer', 'baseball', 'basketball', 'hockey',
  'monkey', 'dragon', 'shadow', 'superman', 'batman', 'matrix',
  'google', 'facebook', 'youtube', 'netflix', 'amazon', 'apple',
  'sunshine', 'princess', 'iloveyou', 'iloveme', 'goodluck',
  'changeme', 'password1', '1234567', '7777777', '9999999',
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'master', 'system',
  'testing', 'tester', 'developer', 'software', 'boardtau',
  'camiling', 'tarlac', 'philippines', 'university', 'student',
  'teacher', 'landlord', 'boarding', 'house', 'room123',
  'guest123', 'signin', 'signup', 'secure', 'security',
  'trustme', 'welcome1', 'welcome123', 'hellowworld', 'hello123',
  'abc12345', 'qwerty123', 'password@123', 'Pass123!', 'Admin123',
  'root123', 'access', 'default', 'passcode', 'security1',
  'tau12345', 'boardtau123', 'boardtau2024', 'boardtau2025',
  'P@ssword123', 'Password123!', 'Welcome1!', 'Welcome123!', 'Admin123!',
  'Boardtau123!', 'User123!', 'Student123!', 'Teacher123!', 'Guest123!',
  'Summer2024!', 'Summer2025!', 'Winter2024!', 'Winter2025!',
  'Spring2024!', 'Spring2025!', 'Autumn2024!', 'Autumn2025!',
  'Iloveboardtau123!', 'Boardtau@2024', 'Boardtau@2025', 'Camiling123!',
  'Tarlac123!', 'Philippines123!', 'Qwerty123!', 'Asdfgh123!',
  'Zxcvbn123!', '12345678aA!', 'Password@123', 'ChangeMe123!',
  'BoardingHouse123!', 'MyRoom123!', 'Boarder123!', 'Host123!', 'Password@123'
].map(p => p.toLowerCase());

/**
 * Checks if a password is on the forbidden list.
 */
export const isForbiddenPassword = (password: string): boolean => {
  return FORBIDDEN_PASSWORDS.includes(password.toLowerCase());
};
