/**
 * Modelo mínimo compatible con backend/RN.
 * Extiende según tu API real.
 */
export type AppUser = {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  jobTitle?: string;
  companySection?: string;
};
