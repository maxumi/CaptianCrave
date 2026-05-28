export interface User {
  id: string;
  userName: string;
  email: string;
  emailConfirmed?: boolean;
  roles?: string[];
}