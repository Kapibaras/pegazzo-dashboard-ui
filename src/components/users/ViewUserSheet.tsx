import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { Button } from '../ui/button';
import CONFIG from '@/config';
import { CircleUserRound, ShieldUser } from 'lucide-react';
import { User } from '@/types/user';
import { formatLongDatetime } from '@/utils/datetime';
import ChangeRoleInput from './table/ChangeRoleInput';
import { Role } from '@/lib/schemas/userSchema';
import { UpdateUserNamesSheet } from './UpdateUserNamesSheet';
import { UpdateUserPasswordSheet } from './UpdateUserPasswordSheet';
import AlertDeleteUser from './AlertDeleteUser';

const ViewUserSheet = ({ user, children }: { user: User; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const IconRole = user.role === CONFIG.USER_ROLES.OWNER ? ShieldUser : CircleUserRound;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="text-carbon-500 [&>button]:hover:text-terciary-500 [&>button]:text-carbon-500 bg-surface-500 fixed top-[4rem] w-full gap-0 overflow-y-auto md:max-w-sm md:gap-1 lg:h-[calc(100vh-4rem)] [&>button>svg]:h-6 [&>button>svg]:w-6 [&>button>svg]:flex-shrink-0">
        <SheetHeader>
          <SheetTitle className="typo-subtitle text-carbon-500 mb-3">Usuario</SheetTitle>
          <SheetDescription className="typo-text text-carbon-300">
            Estos son los datos del usuario seleccionado:
          </SheetDescription>
        </SheetHeader>
        <section className="mx-3 flex flex-col gap-6">
          <div className="bg-surface-100 border-secondary-100 flex flex-col gap-2.5 rounded-md border p-4">
            <div className="flex flex-col items-center">
              <div className="typo-subtitle text-primary-600 text-center">
                <IconRole className="mr-1 mb-1 inline h-7 w-7" />
                <span className="inline w-fit text-center text-balance break-words whitespace-normal">
                  {user.name} {user.surnames}
                </span>
              </div>
              <span className="typo-bold-text text-primary-800 w-fit">{user.username}</span>
            </div>
            <div className="typo-sm-text text-carbon-300 flex flex-col">
              <span>
                <b>Creado:</b> {formatLongDatetime(user.createdAt)}
              </span>
              <span>
                <b>Modificado:</b> {formatLongDatetime(user.updatedAt)}
              </span>
            </div>
          </div>
          <ChangeRoleInput currentRole={user.role as Role} username={user.username} />
        </section>
        <SheetFooter className="mb-[4rem] flex flex-col gap-5 lg:mb-0">
          <UpdateUserNamesSheet
            userId={user.username}
            onSuccess={() => setOpen(false)}
            name={user.name}
            surnames={user.surnames}
          >
            <Button className="bg-terciary-500 hover:bg-primary-700 text-primary-100 typo-bold-text flex cursor-pointer items-center justify-center rounded-md px-28 py-5.5 text-center hover:shadow-sm">
              Editar Nombre
            </Button>
          </UpdateUserNamesSheet>
          <UpdateUserPasswordSheet userId={user.username} onSuccess={() => setOpen(false)}>
            <Button className="bg-terciary-500 hover:bg-primary-700 text-primary-100 typo-bold-text flex cursor-pointer items-center justify-center rounded-md px-28 py-5.5 text-center hover:shadow-sm">
              Cambiar Contraseña
            </Button>
          </UpdateUserPasswordSheet>
          <AlertDeleteUser username={user.username} onSuccess={() => setOpen(false)}>
            <Button
              disabled={user.role === CONFIG.USER_ROLES.OWNER}
              className="bg-error-400 hover:bg-error-500 text-error-50 typo-bold-text flex cursor-pointer items-center justify-center rounded-md px-28 py-5.5 text-center hover:text-white hover:shadow-sm"
            >
              Eliminar Usuario
            </Button>
          </AlertDeleteUser>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ViewUserSheet;
