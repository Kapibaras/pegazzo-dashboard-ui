"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { logout } from "@/actions/logout";
import { Button } from "@/components/ui/button";

export default function LogoutButton({ initialUsername }: { initialUsername: string | null }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [username] = useState<string | null>(initialUsername); 

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión correctamente.",
          variant: "success",
        });
        router.push("/login");
      }
    } catch (err) {
      toast({
        title: "Error inesperado",
        description: "Algo salió mal al cerrar sesión.",
        variant: "destructive",
      });
    }
  };

  if (!username) return null;

  return (
    <div className="flex items-center gap-4">
      <span>Hola, {username} 👋</span>
      <Button
        onClick={handleLogout}
        className="bg-terciary-500 hover:bg-primary-700 text-primary-100 rounded-md py-3 px-6 font-semibold transition-colors"
      >
        Logout
      </Button>
    </div>
  );
}