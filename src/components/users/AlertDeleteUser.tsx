import { deleteUserAction } from '@/actions/users';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import { useToast } from '../ui/use-toast';

const AlertDeleteUser = ({
  username,
  children,
  onSuccess,
}: {
  username: string;
  children: React.ReactNode;
  onSuccess?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { handleApiError } = useApiErrorHandler();

  const handleOnConfirm = async () => {
    setIsLoading(true);
    const result = await deleteUserAction(username);
    setIsLoading(false);

    if (!result.success) {
      handleApiError(
        {
          status: result.status || 500,
          detail: result.detail || 'Error al eliminar el usuario.',
        },
        ['users'],
      );

      setOpen(false);
      return;
    }

    toast({
      title: 'Usuario eliminado',
      description: `El usuario ${username} ha sido eliminado exitosamente.`,
      variant: 'success',
    });

    setOpen(false);
    if (onSuccess) onSuccess();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="typo-subtitle text-carbon-500">
            ¿Estás seguro de eliminar a {username}?
          </AlertDialogTitle>
          <AlertDialogDescription className="typo-text text-carbon-300">
            Esta acción no puede ser deshecha. Esto eliminará permanentemente la cuenta y no podrá ser accesada ni
            recuperada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3.5">
          <AlertDialogCancel className="typo-bold-text border-secondary-100 text-carbon-300 cursor-pointer py-5.5">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className="typo-bold-text bg-error-400 hover:bg-error-500 text-error-50 cursor-pointer py-5.5 hover:text-white hover:shadow-sm"
            onClick={handleOnConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Eliminando...' : 'Sí, eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDeleteUser;
