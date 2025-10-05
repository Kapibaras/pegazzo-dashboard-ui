import { AuthService, UserService } from "@/services";
import { ScopedAPIClient } from "@/api";
import getCookiesServer from "@/utils/getCookiesServer";

export default async function SSRAPIExample() {
  const initialCookieHeader = await getCookiesServer();

  const scopedClient = new ScopedAPIClient(initialCookieHeader);

  const authService = new AuthService(scopedClient);
  const userService = new UserService(scopedClient);

  try {
    console.log("➡️ Logging in (SSR)...");
    const loginData = await authService.login({
      username: "JuanOvando",
      password: "string",
    });
    console.log("✅ Login data:", loginData);

    console.log("➡️ Fetching users after login (SSR)...");
    const admins = await userService.getAllUsers("administrador");
    console.log("✅ Admins:", admins);

    console.log("➡️ Logging out (SSR)...");
    await authService.logout();
    console.log("✅ Logged out (SSR)");

    console.log("➡️ Fetching users after logout (should fail)...");
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
