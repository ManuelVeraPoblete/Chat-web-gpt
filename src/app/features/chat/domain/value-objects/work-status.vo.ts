// src/app/features/chat/domain/value-objects/work-status.vo.ts

/**
 * ✅ WorkStatus
 * Estados laborales alineados con el backend (/workday).
 *
 * Importante:
 * - ENDED se usa como "desconectado" dentro del mismo día (puede reconectar).
 * - NOT_STARTED: aún no registra entrada.
 */
export enum WorkStatus {
  NOT_STARTED = 'NOT_STARTED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  LUNCH = 'LUNCH',
  ENDED = 'ENDED',
}
