import { User } from './user';

export interface AuthUser {
  id: string;
}

export interface LoginData {
  user: User;
  requiresVerification?: boolean;
}

export interface SignupData {
  user: User;
}

export interface VerifyEmailData {
  message: string;
}
