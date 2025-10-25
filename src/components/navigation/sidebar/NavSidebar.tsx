'use client';

import { Sidebar, SidebarRail } from '@/components/ui/sidebar';
import { useSidebar } from '../../ui/sidebar';
import NavHeader from './NavHeader';
import NavContent from './NavContent';
import { ROUTES_WITH_ICONS } from '@/data/navigation';
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
      <NavContent routes={ROUTES_WITH_ICONS} isExpanded={isExpanded} role={user.role} />
      <NavFooter isExpanded={isExpanded} {...user} />
    </Sidebar>
  );
};

export default NavSidebar;
