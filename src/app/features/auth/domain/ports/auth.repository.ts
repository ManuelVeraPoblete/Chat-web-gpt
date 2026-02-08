import type { Session } from '../models/session.model';

export type RefreshResult = {
  accessToken: string;
  refreshToken?: string;
};

export type AuthRepository = {
  login(email: string, password: string): Promise<Session>;
  refresh(refreshToken: string): Promise<RefreshResult>;
};
