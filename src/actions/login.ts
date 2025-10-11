"use server";

import { AuthService } from "@/services";
import getCookiesServer from "@/utils/getCookiesServer";
import { ScopedAPIClient } from "@/api";
import { cookies } from "next/headers";
import { sign } from "jsonwebtoken";
import VARIABLES from "@/config/variables";

export async function login(formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!username || !password) {
    return { error: "Required attributes username & password" };
  }

  try {
    const initialCookieHeader = await getCookiesServer();
    const scopedClient = new ScopedAPIClient(initialCookieHeader);
    const authService = new AuthService(scopedClient);
    await authService.login({ username, password });

    const sessionToken = sign({ username }, VARIABLES.NEXT_SESSION_SECRET, {
      expiresIn: "1h",
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: "session",
      value: sessionToken,
      httpOnly: false,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600,
    });

    return { success: true };
  } catch (err: any) {
    console.log(err.status_code);
    if (err.status_code === 401) {
      return { error: "Invalid Credentials" };
    } else if (err.status_code === 404) {
      console.log("User not found");
      return { error: "User not found" };
    } else {
      console.log("Something went wrong");
      return { error: "Something went wrong" };
    }
  }
}
