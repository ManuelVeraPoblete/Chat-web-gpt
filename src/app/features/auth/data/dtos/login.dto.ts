import type { User } from '../../domain/models/user.model';

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type LoginResponseDto = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type RefreshRequestDto = {
  refreshToken: string;
};

export type RefreshResponseDto = {
  accessToken: string;
  refreshToken?: string;
};
