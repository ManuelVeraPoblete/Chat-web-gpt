/**
 * Entidad de dominio Usuario.
 * No depende de Angular.
 */
export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  status?: string;
}
