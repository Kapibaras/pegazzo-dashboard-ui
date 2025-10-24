'use server';
import { cookies } from 'next/headers';

export default async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: 'session',
    path: '/',
  });
  return { success: true };
}
