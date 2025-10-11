"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { login } from "@/actions";
import { useRouter } from "next/navigation";

const AuthLogin = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [errors, setErrors] = useState({ username: "", password: "" });

  const sendErrorToast = (message: string) => {
    const { dismiss } = toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
    setTimeout(() => dismiss(), 2000);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const username = (formData.get("username") as string)?.trim() ?? "";
    const password = (formData.get("password") as string)?.trim() ?? "";

    const newErrors = { username: "", password: "" };
    if (!username) newErrors.username = "El nombre de usuario es obligatorio.";
    if (!password) newErrors.password = "La contraseña es obligatoria.";

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    const result = await login(formData);
    if (result.error) {
      switch (result.error) {
        case "Required attributes username & password":
          sendErrorToast("Debes ingresar un username y password");
          break;
        case "Invalid Credentials":
          sendErrorToast("Usuario y/o contraseña son incorrectos");
          break;
        case "User not found":
          sendErrorToast("Usuario no encontrado");
          break;
        case "Something went wrong":
          sendErrorToast("Tuvimos un problema, inténtelo más tarde");
          break;
        default:
          sendErrorToast("Ocurrió un error inesperado.");
      }
    } else {
      router.push("/");
    }
  };

  return (
    <main className="flex items-center justify-center w-full h-screen bg-surface-500 md:bg-terciary-500 box-border md:py-24 px-6">
      <div className="flex flex-col items-center justify-center w-full max-w-120 bg-surface-500 box-border px-8 md:py-12 pb-50 gap-10 md:gap-10 rounded-lg md:shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3">
          <Image src="/images/logos/pegazzo.png" alt="Pegazzo" width={286} height={46} className="w-full max-w-71.5 h-auto object-contain" priority />
          <Image src="/images/logos/logo_pegazzo.png" alt="Pegazzo Logo" width={230} height={153} className="w-full max-w-58 h-auto object-contain" priority />
          <Image src="/images/logos/dashboard.png" alt="Dashboard" width={169} height={29} className="w-full max-w-42 h-auto object-contain" priority />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          <FieldSet>
            <FieldGroup className="flex flex-col gap-8">
              <Field data-invalid={!!errors.username}>
                <FieldLabel htmlFor="username" className="textBold text-black">Username</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  placeholder="JuanOvando"
                  aria-invalid={!!errors.username}
                  className="flex items-center self-stretch rounded-md placeholder:text-left border border-surface-700 bg-surface-400 shadow-sm py-5.5 px-4.5 focus:border-blue-600 focus:outline-none"
                />
                {errors.username && <FieldError className="text">{errors.username}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password" className="textBold text-black">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="**********"
                  aria-invalid={!!errors.password}
                  className="flex items-center self-stretch rounded-md placeholder:text-left border border-surface-700 bg-surface-400 shadow-sm py-5.5 px-4.5 focus:border-blue-600 focus:outline-none"
                />
                {errors.password && <FieldError className="text">{errors.password}</FieldError>}
              </Field>
            </FieldGroup>
          </FieldSet>

          <Button type="submit" className="flex items-center justify-center bg-terciary-500 hover:bg-primary-700 text-primary-100 text-center textBold py-5.5 px-28 rounded-md">
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </main>
  );
};

export default AuthLogin;
