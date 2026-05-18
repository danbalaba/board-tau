/**
 * A curated list of the most commonly used/compromised passwords.
 * These are rejected during signup to prevent weak accounts.
 * Contains 220+ highly common guessable passwords, including mixed casing, numbers, and special characters.
 */
export const FORBIDDEN_PASSWORDS = [
  // --- Simple & Classic Common Passwords ---
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

  // --- Capstone & Platform Specific Complex Patterns ---
  'P@ssword123', 'Password123!', 'Welcome1!', 'Welcome123!', 'Admin123!',
  'Boardtau123!', 'User123!', 'Student123!', 'Teacher123!', 'Guest123!',
  'Summer2024!', 'Summer2025!', 'Winter2024!', 'Winter2025!',
  'Spring2024!', 'Spring2025!', 'Autumn2024!', 'Autumn2025!',
  'Iloveboardtau123!', 'Boardtau@2024', 'Boardtau@2025', 'Camiling123!',
  'Tarlac123!', 'Philippines123!', 'Qwerty123!', 'Asdfgh123!',
  'Zxcvbn123!', '12345678aA!', 'Password@123', 'ChangeMe123!',
  'BoardingHouse123!', 'MyRoom123!', 'Boarder123!', 'Host123!',

  // --- Pwned Complex Keyboards & Standard Sequences ---
  'Pa$$w0rd!', 'P@$$w0rd123!', 'Password123@', 'Admin@123', 'User@123',
  'LetMeIn123!', 'LetMeIn1!', 'Letmeout123!', 'Qwertyuiop1!', 'Asdfghjkl1!',
  'Zxcvbnm1!', 'Iloveyou@123', 'Iloveyou123!', 'Sunshine123!', 'Princess123!',
  'Dragon123!', 'Monkey123!', 'Shadow123!', 'Batman123!', 'Superman123!',
  'Jesus123!', 'Jesus@123', 'Changeme@123', 'Secret123!', 'Secret@123',
  'Football123!', 'Soccer123!', 'Baseball123!', 'Basketball123!', 'Google123!',
  'Facebook123!', 'Youtube123!', 'Netflix123!', 'Amazon123!', 'Apple123!',
  'Tau123!', 'Boardtau@123', 'Boardtau2026!', 'Boarder123!', 'Staff123!',
  'Staff@123', 'Faculty123!', 'Faculty@123', 'Boardtau@2026', 'TarlacState123!',
  'CamilingTarlac123!', 'Password99!', 'Password01!', 'P@ssword01!', 'P@ssword99!',
  'Password!123', 'Password@123!', 'P@ssword!123', 'P@ssword@123', 'Welcome@123!',
  'Admin12345!', 'Admin!123', 'LetMeIn!123', 'Master123!', 'Master@123',
  'System123!', 'System@123', 'Developer123!', 'Developer@123', 'Software123!',
  'Software@123', 'Boarding@123', 'BoardingHouse!123', 'Landlord123!', 'Landlord@123',
  'Tenant123!', 'Tenant@123', 'Roommate123!', 'Roommate@123', 'Property123!',
  'Property@123', 'College123!', 'College@123', 'Education123!', 'Education@123',

  // --- Theme Expansion: HaveIBeenPwned & Modern Security Lists ---
  'TarlacState@123', 'Philippines@123', 'BoardingHouse@123', 'Camiling@123',
  'TauState123!', 'TarlacAgricultural123!', 'TauUniversity123!', 'TauCamiling123!',
  'BoardtauServer123!', 'BoardtauAdmin123!', 'Database123!', 'Database@123',
  'Nextjs123!', 'Nextjs@123', 'Reactjs123!', 'Reactjs@123', 'Prisma123!',
  'Prisma@123', 'MongoDB123!', 'MongoDB@123', 'Tailwind123!', 'Tailwind@123',
  'Server123!', 'Server@123', 'Network123!', 'Network@123', 'Internet123!',
  'Internet@123', 'Computer123!', 'Computer@123', 'Security@2026',
  'Welcome2026!', 'Welcome@2026', 'Password2026!', 'Password@2026',
  'P@ssword2026!', 'Tau2026!', 'Tau@2026', 'Admin2026!', 'Admin@2026',
  'User2026!', 'User@2026', 'Guest2026!', 'Guest@2026', 'Student2026!',
  'Student@2026', 'Landlord2026!', 'Landlord@2026', 'Tenant2026!', 'Tenant@2026',
  'Room2026!', 'Room@2026', 'House2026!', 'House@2026', 'Home2026!',
  'Home@2026', 'SmartHome123!', 'SmartRoom123!', 'BestRoom123!', 'NiceRoom123!',
  'CleanRoom123!', 'SafeRoom123!', 'SafeHouse123!', 'SafeHome123!',
  'Boarder@123', 'BoardingLife123!', 'BoardingLife@123', 'MyBoarding123!',
  'MyBoarding@123', 'Housemate123!', 'Housemate@123', 'RoomKey123!',
  'RoomKey@123', 'HouseKey123!', 'HouseKey@123', 'LockBox123!',
  'LockBox@123', 'SafeBox123!', 'SafeBox@123', 'GatePass123!',
  'GatePass@123', 'AccessGranted123!', 'AccessGranted@123', 'AuthorizedOnly123!',
  'AuthorizedOnly@123', 'KeepOut123!', 'KeepOut@123', 'NoEntry123!',
  'NoEntry@123', 'NoTrespassing123!', 'PrivateProperty123!', 'PrivateProperty@123',
  'Restricted123!', 'Restricted@123', 'Classified123!', 'Classified@123',
  'Confidential123!', 'Confidential@123', 'TopSecret123!', 'TopSecret@123',
  'UltraSecure123!', 'UltraSecure@123', 'SuperSecure123!', 'SuperSecure@123',
  'HyperSecure123!', 'HyperSecure@123', 'CyberSecurity123!', 'CyberSecurity@123',
  'InfoSec123!', 'InfoSec@123', 'EthicalHacking123!', 'BugBounty123!',
  'PwnedPassword123!', 'PwnedPassword@123', 'Compromised123!', 'Compromised@123'
].map(p => p.toLowerCase());

/**
 * Checks if a password is on the forbidden list.
 */
export const isForbiddenPassword = (password: string): boolean => {
  return FORBIDDEN_PASSWORDS.includes(password.toLowerCase());
};
