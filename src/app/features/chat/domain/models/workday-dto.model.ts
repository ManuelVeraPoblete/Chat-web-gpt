import { WorkStatus } from '../value-objects/work-status.vo';

/**
 * DTO que retorna el backend para /workday/today y /workday/today/statuses.
 * Mantiene el contrato de la API tipado en el Front.
 */
export type WorkdayDto = {
  userId: string;
  dateKey: string;
  status: WorkStatus;

  startedAt: string | null;
  endedAt: string | null;

  pauseStartedAt: string | null;
  lunchStartedAt: string | null;

  totalPauseMinutes: number;
  totalLunchMinutes: number;

  events: Array<{ type: string; at: string }>;
};
