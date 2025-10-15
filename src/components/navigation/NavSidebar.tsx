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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useSidebar } from '../ui/sidebar';
import { useRouter } from 'next/navigation';

const NavMain = [
  {
    title: 'Inicio',
    icon: House,
    url: '/',
  },
  {
    title: 'Balance',
    icon: CircleDollarSign,
    url: '/balance',
  },
  {
    title: 'Coches',
    icon: CarFront,
    url: '/coches',
  },
  {
    title: 'Organización',
    icon: Building2,
    subroutes: [
      { title: 'Usuarios', url: '/usuarios' },
      { title: 'Configuración', url: '/settings' },
    ],
  },
];

const NavSidebar = () => {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />

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

      <SidebarFooter />
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
