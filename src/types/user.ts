import { Role } from '@/lib/schemas/userSchema';

export type User = {
  username: string;
  name: string;
  surnames: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};
