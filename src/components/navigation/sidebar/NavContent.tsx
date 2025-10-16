import { SidebarContent, SidebarGroup, SidebarMenu } from '@/components/ui/sidebar';
import NavCollapsibleRoutes from './NavCollapsibleRoutes';
import NavRoute from './NavRoute';
import { RoutesType } from '@/data/navigation';

const NavContent = ({ routes, isExpanded }: { routes: RoutesType; isExpanded: boolean }) => {
  return (
    <SidebarContent className="pt-5">
      <SidebarGroup className="p-0">
        <SidebarMenu className="gap-3">
          {routes.map((route) =>
            route.subroutes ? (
              <NavCollapsibleRoutes
                key={route.title}
                title={route.title}
                icon={route.icon}
                subroutes={route.subroutes}
                isExpanded={isExpanded}
              />
            ) : (
              <NavRoute key={route.title} title={route.title} icon={route.icon} url={route.url} />
            ),
          )}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
};

export default NavContent;
