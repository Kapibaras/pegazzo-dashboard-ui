"use client";

import { useEffect } from "react";
import { AuthService, UserService } from "@/services";
import { SingletonAPIClient } from "@/api";

export default function CSRAPIExample() {
  useEffect(() => {
    const runExample = async () => {
      const client = SingletonAPIClient.getInstance();
      const authService = new AuthService(client);
      const userService = new UserService(client);

      try {
        console.log("➡️ Logging in (CSR)...");
        const loginData = await authService.login({
          username: "JuanOvando",
          password: "string",
        });
        console.log("Login data:", loginData);

        console.log("➡️ Fetching users after login (CSR)...");
        const users = await userService.getAllUsers("administrador");
        console.log("✅ Users:", users);

        console.log("➡️ Logging out (CSR)...");
        await authService.logout();
        console.log("✅ Logged out (CSR)");

        console.log("➡️ Fetching users after logout (should fail)...");
        try {
          await userService.getAllUsers();
        } catch (err) {
          console.error("❌ Error fetching users after logout:", err);
        }
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

