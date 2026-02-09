/**
 *AppUser (Chat Feature)
 * Modelo mínimo compatible con tu backend.
 *
 * Nota:
 * - Lo mantenemos en /chat/domain para NO depender del feature /home.
 * - Puedes extenderlo si tu backend trae más campos.
 */
export type AppUser = {
  id: string;
  email?: string;
  displayName: string;
  photoUrl?: string;
  jobTitle?: string;
  companySection?: string;
};
