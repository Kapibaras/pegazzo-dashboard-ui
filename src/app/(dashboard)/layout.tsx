import { Header } from '@/components/navigation';
import NavSidebar from '@/components/navigation/NavSidebar';
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
