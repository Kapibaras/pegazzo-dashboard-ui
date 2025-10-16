'use client';

import { Sidebar, SidebarRail } from '@/components/ui/sidebar';
import { useSidebar } from '../../ui/sidebar';
import NavHeader from './NavHeader';
import NavContent from './NavContent';
import routes from './routes';
import NavFooter from './NavFooter';
import { useUser } from '@/contexts/UserProvider';

const NavSidebar = () => {
  const { toggleSidebar, state } = useSidebar();
  const { user } = useUser();
  const isExpanded = state === 'expanded';

  return (
    <Sidebar collapsible="icon" className="shadow-[6px_0_13px_2px_rgba(0,0,0,0.16)]">
      <SidebarRail />
      <NavHeader toggleSidebar={toggleSidebar} />
      <NavContent routes={routes} isExpanded={isExpanded} />
      <NavFooter isExpanded={isExpanded} {...user} />
    </Sidebar>
  );
};

export default NavSidebar;
