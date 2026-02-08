import { WorkStatus } from '../value-objects/work-status.vo';

/**
 * Representa el estado laboral actual del usuario.
 */
export interface Workday {
  status: WorkStatus;
  startedAt?: string;
}
