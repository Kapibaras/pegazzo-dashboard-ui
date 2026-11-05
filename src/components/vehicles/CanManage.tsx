'use client';

import { useUser } from '@/contexts/UserProvider';
import { Role } from '@/lib/schemas/userSchema';

/** Renders its children only for roles that can create/edit/archive vehicles (OWNER and ADMIN). */
const CanManage = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  return user.role === Role.OWNER || user.role === Role.ADMIN ? <>{children}</> : null;
};

export default CanManage;
