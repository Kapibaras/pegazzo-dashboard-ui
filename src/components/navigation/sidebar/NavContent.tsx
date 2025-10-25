import { SidebarContent, SidebarGroup, SidebarMenu } from '@/components/ui/sidebar';
import NavCollapsibleRoutes from './NavCollapsibleRoutes';
import NavRoute from './NavRoute';
import { RoutesType } from '@/data/navigation';
import { Role } from '@/lib/schemas/userSchema';

const NavContent = ({ routes, isExpanded, role }: { routes: RoutesType; isExpanded: boolean; role: Role }) => {
  return (
    <SidebarContent className="pt-5">
      <SidebarGroup className="p-0">
        <SidebarMenu className="gap-3">
          {routes.map((route) => {
            if (!route.allowed.includes(role)) return null;

            if (route.subroutes)
              return (
                <NavCollapsibleRoutes
                  key={route.title}
                  title={route.title}
                  icon={route.icon}
                  subroutes={route.subroutes}
                  isExpanded={isExpanded}
                />
              );
            else return <NavRoute key={route.title} title={route.title} icon={route.icon} url={route.url} />;
          })}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
};

export default NavContent;
