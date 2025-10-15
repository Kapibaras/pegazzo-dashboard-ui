'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  House,
  PanelLeftOpen,
  PanelLeftClose,
  CircleDollarSign,
  CarFront,
  Building2,
  ChevronRight,
  ChevronsUpDown,
  CircleUserRound,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useSidebar } from '../ui/sidebar';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NavMain = [
  {
    title: 'Inicio',
    icon: House,
    url: '/',
  },
  {
    title: 'Balance',
    icon: CircleDollarSign,
    url: '/#',
  },
  {
    title: 'Coches',
    icon: CarFront,
    url: '/#',
  },
  {
    title: 'Organización',
    icon: Building2,
    subroutes: [
      { title: 'Usuarios', url: '/usuarios' },
      { title: 'Configuración', url: '/#' },
    ],
  },
];

const NavSidebar = () => {
  const { toggleSidebar, state } = useSidebar();
  const isExpanded = state === 'expanded';

  return (
    <Sidebar collapsible="icon" className="shadow-[6px_0_13px_2px_rgba(0,0,0,0.16)]">
      <SidebarRail />
      {/* Sidebar Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row justify-between">
            <Image
              src="/images/logos/pegazzo.png"
              alt="Pegazzo"
              width={181}
              height={29}
              priority
              className="mt-1.5 shrink-0 object-contain group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:opacity-0 group-data-[state=expanded]:ml-3"
            />
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary-200/20 md:focus-visible:border-1px md:focus-visible:ring-primary-100 mt-1.5 mr-[0.4rem] shrink-0 cursor-pointer border-none p-5.5 focus-visible:border-none focus-visible:ring-0 md:focus-visible:ring-2"
              onClick={toggleSidebar}
            >
              <PanelLeftOpen className="text-primary-100 hidden size-7 group-data-[state=expanded]:hidden md:block" />
              <PanelLeftClose className="text-primary-100 size-7 group-data-[state=collapsed]:hidden" />
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {/* Sidebar Content */}
      <SidebarContent className="pt-5">
        <SidebarGroup className="p-0">
          <SidebarMenu className="gap-3">
            {NavMain.map((item) =>
              item.subroutes ? (
                <NavCollapsible
                  key={item.title}
                  title={item.title}
                  icon={item.icon}
                  subroutes={item.subroutes}
                  state={state}
                />
              ) : (
                <NavButton key={item.title} title={item.title} icon={item.icon} url={item.url} />
              ),
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      {/* Sidebar Footer */}
      <SidebarFooter className="px-0 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="bg-terciary-500 h-fit cursor-pointer gap-3 rounded-none px-5 py-3.5 group-data-[state=collapsed]:h-[4.15rem]! group-data-[state=collapsed]:w-full!">
                  <CircleUserRound className="size-9! group-data-[state=collapsed]:ml-[0.3rem]" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="typo-bold-text truncate">{'Ruben35'}</span>
                    <span className="typo-sm-text truncate">{'Rubén Hernández'}</span>
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
                    className="hover:bg-primary-200/20! hover:text-carbon-50! typo-text text-primary-100 [&>svg]:text-primary-100! hover:[&>svg]:text-carbon-50! cursor-pointer flex-row items-center gap-2 rounded-lg p-3 [&>svg]:size-5!"
                    onSelect={() => console.log('Close')}
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
    </Sidebar>
  );
};

const NavButton = ({ title, icon: Icon, url }: { title: string; icon: React.ComponentType; url: string }) => {
  return (
    <SidebarMenuItem key={title} className="group-data-[state=collapsed]:ml-2">
      <SidebarMenuButton
        asChild
        tooltip={title}
        className="typo-subtitle h-fit px-4 py-4 group-data-[state=collapsed]:my-2 group-data-[state=collapsed]:h-[2.75rem]! group-data-[state=collapsed]:w-[2.75rem]! group-data-[state=expanded]:hover:rounded-none group-data-[state=collapsed]:[&>span:last-child]:hidden [&>svg]:size-7"
      >
        <a href={url}>
          <Icon />
          <span>{title}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const NavCollapsible = ({
  title,
  icon: Icon,
  subroutes,
  state,
}: {
  title: string;
  icon: React.ComponentType;
  subroutes: { title: string; url: string }[];
  state: 'expanded' | 'collapsed';
}) => {
  const firstUrl = subroutes[0]?.url || '#';
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (state === 'expanded') return;
    e.preventDefault();
    e.stopPropagation();
    router.push(firstUrl);
  };

  return (
    <Collapsible key={title} className="group/collapsible group-data-[state=collapsed]:ml-2" asChild>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={title}
            onClick={handleClick}
            className="typo-subtitle h-fit cursor-pointer px-4 py-4 group-data-[state=collapsed]:my-2 group-data-[state=collapsed]:h-[2.75rem]! group-data-[state=collapsed]:w-[2.75rem]! group-data-[state=expanded]:hover:rounded-none group-data-[state=collapsed]:[&>span:last-child]:hidden [&>svg]:size-7"
          >
            <Icon />
            <span>{title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="border-primary-100 ml-7">
            {subroutes?.map((route) => (
              <SidebarMenuSubItem key={route.title}>
                <SidebarMenuSubButton
                  asChild
                  className="typo-text h-fit px-4 py-4 group-data-[state=expanded]:hover:rounded-sm"
                >
                  <a href={route.url}>
                    <span>{route.title}</span>
                  </a>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default NavSidebar;
