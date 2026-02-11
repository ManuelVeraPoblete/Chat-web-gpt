/**
 * ✅ WorkdayAction
 * Acciones que el usuario ejecuta en la UI.
 *
 * Separar Action de Status evita ambigüedades:
 * - El usuario "hace" una acción (PAUSE, LUNCH, DISCONNECT...)
 * - El backend responde con el status resultante.
 */
export enum WorkdayAction {
  CONNECT = 'CONNECT',       // start() o reconnect (según estado)
  PAUSE = 'PAUSE',
  LUNCH = 'LUNCH',
  RESUME = 'RESUME',         // volver a ACTIVE desde PAUSED/LUNCH
  DISCONNECT = 'DISCONNECT', // end()
  RESET = 'RESET',           // recuperación (force ACTIVE)
}
