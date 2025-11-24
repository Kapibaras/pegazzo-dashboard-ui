import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { ChevronsUpDown, CircleUserRound, LogOut, ShieldUser } from 'lucide-react';
import CONFIG from '@/config';
import logout from '@/actions/auth/logout';
import { useRouter } from 'next/navigation';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import { useToast } from '@/components/ui/use-toast';

const NavFooter = ({
  isExpanded,
  username,
  name,
  surnames = '',
  role,
}: {
  isExpanded: boolean;
  username: string;
  name: string;
  surnames: string;
  role: string;
}) => {
  const firstSurname = surnames.split(' ')[0] || '';
  const IconRole = role === CONFIG.USER_ROLES.OWNER ? ShieldUser : CircleUserRound;

  const router = useRouter();
  const { toast } = useToast();
  const { handleApiError } = useApiErrorHandler();

  const handleLogout = async () => {
    const result = await logout();

    if (!result.success) {
      handleApiError(
        {
          status: result.status || 500,
          detail: result.detail || 'Error al cerrar sesión.',
        },
        ['auth', 'common'],
      );
      return;
    }

    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente.',
      variant: 'success',
    });

    router.push('/login');
  };

  return (
    <SidebarFooter className="px-0 py-0">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="bg-terciary-500 h-fit cursor-pointer gap-3 rounded-none px-5 py-3.5 group-data-[state=collapsed]:h-[4.15rem]! group-data-[state=collapsed]:w-full!">
                <IconRole className="size-9! group-data-[state=collapsed]:ml-[0.3rem]" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="typo-bold-text truncate">{username}</span>
                  <span className="typo-sm-text truncate">{`${name} ${firstSurname}`}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-6!" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={isExpanded ? 'top' : 'right'}
              align={isExpanded ? 'start' : 'end'}
              sideOffset={isExpanded ? 15 : 10}
              alignOffset={isExpanded ? 15 : 30}
              className="bg-terciary-500 border-terciary-700 w-64 rounded-xl border-2 p-3"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="hover:bg-primary-200/20! hover:text-carbon-50! typo-text text-primary-100 [&>svg]:text-primary-100! hover:[&>svg]:text-carbon-50! flex cursor-pointer flex-row items-center gap-2 rounded-lg p-3 [&>svg]:size-5!"
                  onSelect={handleLogout}
                >
                  <LogOut />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default NavFooter;
