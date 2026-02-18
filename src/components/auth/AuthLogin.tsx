'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Field, FieldSet, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { login } from '@/actions/auth';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';

const AuthLogin = () => {
  const router = useRouter();
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleApiError } = useApiErrorHandler();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const username = (formData.get('username') as string)?.trim() ?? '';
    const password = (formData.get('password') as string)?.trim() ?? '';

    const newErrors = { username: '', password: '' };

    if (!username) newErrors.username = 'El nombre de usuario es obligatorio.';
    if (!password) newErrors.password = 'La contraseña es obligatoria.';

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setIsSubmitting(true);
    const result = await login(formData);

    if ('status' in result && !result.success) {
      handleApiError(
        {
          status: result.status || 500,
          detail: result.detail || 'Something went wrong',
        },
        ['auth'],
      );
    } else {
      router.push('/');
    }

    setIsSubmitting(false);
  };

  return (
    <main className="bg-surface-500 md:bg-terciary-500 box-border flex h-screen w-full items-center justify-center px-6 md:py-24">
      <div className="bg-surface-500 box-border flex w-full max-w-120 flex-col items-center justify-center gap-10 rounded-lg pb-16 md:gap-10 md:px-8 md:py-12 md:shadow-sm">
        <div className="mt-1 flex flex-col items-center justify-center gap-3 px-8">
          <Image
            src="/images/logos/pegazzo.png"
            alt="Pegazzo"
            width={286}
            height={46}
            className="h-auto w-full max-w-71.5 object-contain"
            priority
          />
          <Image
            src="/images/logos/logo_pegazzo.png"
            alt="Pegazzo Logo"
            width={230}
            height={153}
            className="h-auto w-full max-w-58 object-contain"
            priority
          />
          <Image
            src="/images/logos/dashboard.png"
            alt="Dashboard"
            width={169}
            height={29}
            className="h-auto w-full max-w-42 object-contain"
            priority
          />
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-10">
          <FieldSet className="md:px-5">
            <FieldGroup className="flex flex-col gap-8">
              <Field data-invalid={!!errors.username}>
                <FieldLabel htmlFor="username" className="typo-bold-text">
                  Username
                </FieldLabel>
                <Input
                  id="username"
                  name="username"
                  placeholder="Nombre de usuario"
                  aria-invalid={!!errors.username}
                  className="typo-text border-surface-700 bg-surface-400 flex items-center self-stretch rounded-md border px-4.5 py-5.5 shadow-sm placeholder:text-left focus:border-blue-600 focus:outline-none"
                />
                {errors.username && <FieldError className="typo-sm-text">{errors.username}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password" className="typo-bold-text">
                  Contraseña
                </FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="******"
                  aria-invalid={!!errors.password}
                  className="typo-text border-surface-700 bg-surface-400 flex items-center self-stretch rounded-md border px-4.5 py-5.5 shadow-sm placeholder:text-left focus:border-blue-600 focus:outline-none"
                />
                {errors.password && <FieldError className="typo-sm-text">{errors.password}</FieldError>}
              </Field>
            </FieldGroup>
          </FieldSet>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-terciary-500 hover:bg-primary-700 text-primary-100 typo-bold-text flex cursor-pointer items-center justify-center rounded-md py-5.5 text-center hover:shadow-sm md:mx-5"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin" /> Iniciando Sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>
      </div>
    </main>
  );
};

export default AuthLogin;
