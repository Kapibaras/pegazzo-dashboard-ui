"use client";

import { useEffect } from "react";
import { AuthService, UserService } from "@/services";
import { SingletonAPIClient } from "@/api";
import { getCookie } from "@/api/helpers";

export default function CSRAPIExample() {
  useEffect(() => {
    const runExample = async () => {
      const client = SingletonAPIClient.getInstance();
      const authService = new AuthService(client);
      const userService = new UserService(client);

      try {
        console.log("➡️ Logging in (CSR)...");
        const loginResponse = await authService.login({
          username: "JuanOvando",
          password: "string",
        });

        console.log("Login response:", loginResponse.headers);

        console.log("➡️ Cookies actuales (document.cookie):", document.cookie);

        const csrfAccess = getCookie("csrf_access_token");
        const csrfRefresh = getCookie("csrf_refresh_token");
        console.log("CSRF Access:", csrfAccess);
        console.log("CSRF Refresh:", csrfRefresh);

        console.log("➡️ Fetching users after login (CSR)...");
        const usersResponse = await userService.getAllUsers("administrador");
        console.log("✅ Users:", usersResponse.data);

        console.log("➡️ Logging out (CSR)...");
        await authService.logout();
      } catch (err) {
        console.error("❌ Unexpected error (CSR):", err);
      }
    };

    runExample();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>CSR API Example</h1>
      <p>
        Open the <strong>browser console</strong> to see the login → fetch users
        → logout → fetch users flow.
      </p>
    </div>
  );
}
