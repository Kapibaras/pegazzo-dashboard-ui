import { cookies } from "next/headers";

export default async function getCookiesServer(): Promise<string> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  return allCookies.map((c: any) => `${c.name}=${c.value}`).join("; ");
}
  