'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserForm } from './UserForm';

interface UpdateUserNamesSheetProps {
  children: React.ReactNode;
  userId: string;
}

export function UpdateUserNamesSheet({ children, userId }: UpdateUserNamesSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="text-carbon-500 [&>button]:hover:text-terciary-500 [&>button]:text-carbon-500 fixed top-[4rem] flex h-[calc(100vh-4rem)] w-full flex-col gap-3 overflow-hidden md:max-w-sm md:gap-1 [&>button>svg]:h-6 [&>button>svg]:w-6 [&>button>svg]:flex-shrink-0">
        <SheetHeader className="shrink-0">
          <SheetTitle className="typo-subtitle text-carbon-500 mb-1">Editar Nombre</SheetTitle>
          <SheetDescription className="typo-text text-carbon-300">
            Edita los datos personales del usuario:
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col px-4.5">
          <UserForm mode="updateNames" userId={userId} onSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
