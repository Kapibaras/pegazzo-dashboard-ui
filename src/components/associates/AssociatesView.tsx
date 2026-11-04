'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Search, UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreateAssociateDialog } from '@/components/vehicles/QuickCreateDialogs';
import { BUTTON_ICON_CLASS, primaryButton } from '@/lib/buttonStyles';
import { searchFieldClass } from '@/lib/formField';
import { cn } from '@/lib/utils';
import { Associate } from '@/types/vehicle';
import AssociateSheet from './AssociateSheet';

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

/**
 * The list arrives already fetched by the server page; search runs here (the catalog is small and the backend does
 * not paginate it). Edit/delete go through server actions that revalidate `/socios`, and `router.refresh()` pulls the
 * fresh list after a create.
 */
const AssociatesView = ({ associates }: { associates: Associate[] }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return associates;
    return associates.filter((associate) => normalize(`${associate.name} ${associate.surnames}`).includes(term));
  }, [associates, search]);

  const total = associates.length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="typo-title text-carbon-500">Socios</h1>
          <p className="typo-text text-carbon-300" aria-live="polite">
            {total} {total === 1 ? 'socio registrado' : 'socios registrados'}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className={primaryButton()}>
          <PlusCircle className={BUTTON_ICON_CLASS} aria-hidden />
          Agregar socio
        </Button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="text-carbon-200 absolute top-1/2 left-4 size-4 -translate-y-1/2" aria-hidden />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar socio..."
          aria-label="Buscar socio"
          className={searchFieldClass()}
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="bg-primary-50 flex size-14 items-center justify-center rounded-full">
              <UsersRound className="text-primary-700 size-7" aria-hidden />
            </div>
            <p className="typo-subtitle text-carbon-500">
              {total === 0 ? 'Aún no hay socios registrados' : 'No hay socios con esa búsqueda'}
            </p>
            <p className="typo-sm-text text-carbon-300">
              {total === 0 ? 'Agrega el primero o créalo al registrar un coche.' : 'Prueba con otro nombre.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border-secondary-100/80 min-w-0 overflow-hidden rounded-lg border shadow-sm">
          <Table>
            <TableHeader className="border-primary-700/20 from-secondary-500 to-secondary-600 border-b bg-gradient-to-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className="typo-bold-text text-primary-100 px-5 py-3">Socio</TableHead>
                <TableHead className="typo-bold-text text-primary-100 hidden px-5 py-3 md:table-cell">
                  Teléfonos
                </TableHead>
                <TableHead className="typo-bold-text text-primary-100 px-5 py-3 text-right">Coches</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((associate, index) => (
                <TableRow
                  key={associate.id}
                  tabIndex={0}
                  onClick={() => setSelectedId(associate.id)}
                  onKeyDown={(event) => event.key === 'Enter' && setSelectedId(associate.id)}
                  className={cn(
                    'border-secondary-100/50 hover:bg-primary-50/80 cursor-pointer transition-colors duration-150',
                    index % 2 === 0 ? 'bg-white' : 'bg-surface-300/50',
                  )}
                >
                  <TableCell className="typo-bold-text text-carbon-500 px-5 py-3.5">
                    {associate.name} {associate.surnames}
                  </TableCell>
                  <TableCell className="typo-numbers text-carbon-300 hidden px-5 py-3.5 md:table-cell">
                    {associate.telephones?.length ? associate.telephones.join(' · ') : '—'}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-right">
                    <Badge
                      className={cn(
                        'font-medium',
                        (associate.car_count ?? 0) > 0
                          ? 'bg-primary-50 text-primary-700 hover:bg-primary-50'
                          : 'bg-secondary-50 text-carbon-400 hover:bg-secondary-50',
                      )}
                    >
                      {associate.car_count ?? 0}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AssociateSheet associateId={selectedId} onClose={() => setSelectedId(null)} />
      <CreateAssociateDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={() => router.refresh()} />
    </div>
  );
};

export default AssociatesView;
