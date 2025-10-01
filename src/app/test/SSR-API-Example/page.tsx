import { AuthService, UserService } from "@/services";
import { ScopedAPIClient } from "@/api";
import buildCookieHeader from "@/utils/buildCookieHeader";

export default async function SSRAPIExample() {
  const initialCookieHeader = await buildCookieHeader();

  let sessionCookieHeader = initialCookieHeader;

  const client = new ScopedAPIClient(initialCookieHeader);
  const authService = new AuthService(client);
  
  const ssrContext = {
    setCookie: (cookie: string) => {
      const newCookie = cookie.split(";")[0]; 
      sessionCookieHeader = [sessionCookieHeader, newCookie]
        .filter(Boolean) 
        .join("; ");

      console.log("➡️ SSR context set cookie:", cookie);
      console.log("➡️ Session cookie header updated to:", sessionCookieHeader);
    },
  };

  try {
    console.log("➡️ Logging in (SSR)...");
    
    const loginData = await authService.login(
      { username: "JuanOvando", password: "string" },
      ssrContext 
    );

    console.log("✅ Login data:", loginData);

    const sessionClient = new ScopedAPIClient(sessionCookieHeader);
    const userService = new UserService(sessionClient); 

    console.log("➡️ Fetching users after login (SSR)...");
    
    const admins = await userService.getAllUsers("administrador");
    console.log("✅ Admins:", admins);
    try {
      await userService.getAllUsers();
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
        Check the <strong>terminal console</strong> for login → fetch users flow.
      </p>
    </div>
  );
}