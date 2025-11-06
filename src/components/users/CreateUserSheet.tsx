'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserForm } from './UserForm';
import { PlusCircle } from 'lucide-react';

export function CreateUserSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-terciary-500 hover:bg-primary-700 text-primary-100 typo-bold-text flex min-h-10 cursor-pointer items-center justify-center px-6 py-3 text-center hover:shadow-sm md:px-6 md:py-3">
          <PlusCircle className="!h-6 !w-6" />
          <span className="mr-1 hidden lg:inline">Agregar Usuario</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="text-carbon-500 [&>button]:hover:text-terciary-500 [&>button]:text-carbon-500 fixed top-[4rem] flex h-[calc(100vh-4rem)] w-full flex-col gap-3 overflow-y-auto md:max-w-sm md:gap-1 [&>button>svg]:h-6 [&>button>svg]:w-6 [&>button>svg]:flex-shrink-0">
        <SheetHeader className="shrink-0">
          <SheetTitle className="typo-subtitle text-carbon-500 mb-1">Nuevo Usuario</SheetTitle>
          <SheetDescription className="typo-text text-carbon-300">
            Escribe los datos para el nuevo usuario:
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col px-4.5">
          <UserForm mode="create" onSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
