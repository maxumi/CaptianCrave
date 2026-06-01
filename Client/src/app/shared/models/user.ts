export interface AuthState {
  userId: number;
  name: string;
  email: string;
  role: string;
  token: string;
}

export type User = AuthState;