/**
 * Modelo mínimo alineado a RN: user viene desde /auth/login.
 * Extiende según tu backend (phone, jobTitle, etc.).
 */
export type User = {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  companySection?: string;
  jobTitle?: string;
  roles?: string[];
};
