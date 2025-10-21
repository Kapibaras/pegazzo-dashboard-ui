import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

const NavRoute = ({ title, icon: Icon, url }: { title: string; icon: React.ComponentType; url: string }) => {
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

export default NavRoute;
