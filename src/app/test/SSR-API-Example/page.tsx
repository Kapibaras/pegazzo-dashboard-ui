import { AuthService, UserService } from "@/services";
import { ScopedAPIClient } from "@/api";
import { cookies } from "next/headers";

export default async function SSRAPIExample() {
  const cookieStore = await cookies();
  const initialCookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  console.log("➡️ Initial cookies from SSR:", initialCookieHeader);

  const client = new ScopedAPIClient(initialCookieHeader);
  const authService = new AuthService(client);

  try {
    console.log("➡️ Logging in (SSR)...");
    const loginResponse = await authService.login({
      username: "JuanOvando",
      password: "string",
    });

    console.log("Login response headers:", loginResponse.headers);
    console.log("Login response data:", loginResponse.data);

    const setCookieHeader = loginResponse.headers["set-cookie"] as string[] | string | undefined;
    let sessionCookieHeader = initialCookieHeader;

    if (setCookieHeader) {
      const cookiesFromLogin = Array.isArray(setCookieHeader)
        ? setCookieHeader.map((c) => c.split(";")[0]).join("; ")
        : setCookieHeader.split(";")[0];
    
      sessionCookieHeader = [initialCookieHeader, cookiesFromLogin]
        .filter(Boolean)
        .join("; ");
    }

    console.log("➡️ Session cookies:", sessionCookieHeader);

    const sessionClient = new ScopedAPIClient(sessionCookieHeader);
    const sessionAuthService = new AuthService(sessionClient);
    const userService = new UserService(sessionClient);

    console.log("➡️ Fetching users after login (SSR)...");
    const adminsResponse = await userService.getAllUsers("administrador");
    console.log("✅ Admins:", adminsResponse.data);

    console.log("➡️ Logging out (SSR)...");
    await sessionAuthService.logout();

    console.log("➡️ Fetching users after logout (SSR, should fail)...");
    const noSessionClient = new ScopedAPIClient(""); 
    const noSessionUserService = new UserService(noSessionClient);

    try {
      await noSessionUserService.getAllUsers();
    } catch (err) {
      console.error("❌ Error fetching users after logout:", err);
    }
  } catch (err) {
    console.error("❌ Unexpected error (SSR):", err);
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>SSR API Example</h1>
      <p>
        Check the <strong>terminal console</strong> (server logs) to see the
        login → fetch users → logout → fetch users flow.
      </p>
    </div>
  );
}
