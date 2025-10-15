'use client';

import { PanelLeftOpen } from 'lucide-react';
import { useSidebar } from '../ui/sidebar';

const Header = ({ title }: { title: string }) => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="bg-terciary-500 text-primary-100 typo-subtitle flex h-16 w-full items-center px-5 shadow-[0_6px_9px_0_rgba(0,0,0,0.25)]">
      <PanelLeftOpen width={28} height={28} className="text-primary-100 md:hidden" onClick={toggleSidebar} />
      <span className="absolute left-1/2 -translate-x-1/2 lg:relative lg:translate-0">{title}</span>
    </header>
  );
};

export default Header;
