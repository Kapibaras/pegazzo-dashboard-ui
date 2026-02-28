import { Button } from '@/components/ui/button';
import { SidebarHeader, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Image from 'next/image';

const NavHeader = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem className="flex flex-row justify-between">
          <Image
            src="/images/logos/pegazzo-horizontal.png"
            alt="Pegazzo Auto"
            width={158}
            height={54}
            priority
            className="mt-[1rem] ml-[1.8rem] shrink-0 scale-[1.25] object-contain brightness-0 invert group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:md:ml-0"
          />
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary-200/20 md:focus-visible:border-1px md:focus-visible:ring-primary-100 mr-[0.4rem] shrink-0 cursor-pointer border-none p-5.5 focus-visible:border-none focus-visible:ring-0 md:focus-visible:ring-2"
            onClick={toggleSidebar}
          >
            <PanelLeftOpen className="text-primary-100 hidden size-7 group-data-[state=expanded]:hidden md:block" />
            <PanelLeftClose className="text-primary-100 size-7 group-data-[state=collapsed]:hidden" />
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
};

export default NavHeader;
