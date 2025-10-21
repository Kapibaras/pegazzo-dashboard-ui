'use client';

import { PanelLeftOpen } from 'lucide-react';
import { useSidebar } from '../ui/sidebar';
import { Button } from '../ui/button';
import { ROUTES_PATHNAMES } from '@/data/navigation';
import { usePathname } from 'next/navigation';

const Header = () => {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const title = ROUTES_PATHNAMES[pathname] || 'Unknown';

  return (
    <header className="bg-terciary-500 text-primary-100 typo-subtitle flex h-16 w-full items-center px-5 shadow-[0_6px_9px_0_rgba(0,0,0,0.25)]">
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-primary-200/20 md:focus-visible:border-1px md:focus-visible:ring-primary-100 mb-0.5 cursor-pointer border-none p-5.5 focus-visible:border-none focus-visible:ring-0 md:hidden md:focus-visible:ring-2"
        onClick={toggleSidebar}
      >
        <PanelLeftOpen className="text-primary-100 size-7" />
      </Button>
      <span className="absolute left-1/2 -translate-x-1/2 lg:relative lg:translate-0">{title}</span>
    </header>
  );
};

export default Header;
