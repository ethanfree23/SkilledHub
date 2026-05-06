export type UserRole = 'technician' | 'company' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  first_name?: string | null;
  last_name?: string | null;
  [key: string]: unknown;
}
