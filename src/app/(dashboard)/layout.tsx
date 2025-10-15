import { Header, NavSidebar } from '@/components/navigation';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <NavSidebar />
      <SidebarInset>
        <main className="w-full bg-red-500">
          <Header title="Inicio" />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
