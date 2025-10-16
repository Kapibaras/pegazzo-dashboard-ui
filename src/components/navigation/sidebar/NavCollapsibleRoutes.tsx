import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const NavCollapsibleRoutes = ({
  title,
  icon: Icon,
  subroutes,
  isExpanded,
}: {
  title: string;
  icon: React.ComponentType;
  subroutes: { title: string; url: string }[];
  isExpanded: boolean;
}) => {
  const firstUrl = subroutes[0]?.url || '#';
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (isExpanded) return;
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

export default NavCollapsibleRoutes;
