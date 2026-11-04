'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Tags, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CreateModelDialog } from '@/components/vehicles/QuickCreateDialogs';
import { fieldClass } from '@/lib/formField';
import { VehicleModelGroup } from '@/types/vehicle';
import DeleteModelDialog, { ModelToDelete } from './DeleteModelDialog';

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

/**
 * Brands are not an entity in the backend: a brand exists while it has at least one model, so "add model" with a new
 * brand name creates the brand and deleting its last model removes it. The data comes from the server page; search runs
 * here, delete goes through a server action that revalidates this route and `router.refresh()` follows a create.
 */
const ModelCatalogView = ({ groups }: { groups: VehicleModelGroup[] }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createMake, setCreateMake] = useState<string | undefined>();
  const [toDelete, setToDelete] = useState<ModelToDelete | null>(null);

  const openCreate = (make?: string) => {
    setCreateMake(make);
    setCreateOpen(true);
  };

  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return groups;
    return groups
      .map((group) => {
        if (normalize(group.make).includes(term)) return group;
        return { ...group, models: group.models.filter((item) => normalize(item.model).includes(term)) };
      })
      .filter((group) => group.models.length > 0);
  }, [groups, search]);

  const modelCount = groups.reduce((sum, group) => sum + group.models.length, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/coches"
            className="typo-sm-text text-carbon-300 hover:text-carbon-500 mb-1 inline-flex items-center gap-1"
          >
            <ArrowLeft className="size-3.5" aria-hidden /> Coches
          </Link>
          <h1 className="typo-title text-carbon-500">Catálogo de marcas y modelos</h1>
          <p className="typo-text text-carbon-300" aria-live="polite">
            {groups.length} {groups.length === 1 ? 'marca' : 'marcas'} · {modelCount}{' '}
            {modelCount === 1 ? 'modelo' : 'modelos'}
          </p>
        </div>
        <Button
          onClick={() => openCreate()}
          className="bg-terciary-500 text-primary-100 hover:bg-primary-800 cursor-pointer gap-2"
        >
          <Plus className="size-4" /> Agregar modelo
        </Button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="text-carbon-200 absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar marca o modelo"
          aria-label="Buscar marca o modelo"
          className={fieldClass({ className: 'pl-9' })}
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="bg-primary-50 flex size-14 items-center justify-center rounded-full">
              <Tags className="text-primary-700 size-7" aria-hidden />
            </div>
            <p className="typo-subtitle text-carbon-500">
              {groups.length === 0 ? 'El catálogo está vacío' : 'Sin resultados'}
            </p>
            <p className="typo-sm-text text-carbon-300">
              {groups.length === 0 ? 'Agrega un modelo para empezar.' : 'Prueba con otra marca o modelo.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((group) => {
            const fullGroup = groups.find((item) => item.make === group.make) ?? group;
            return (
              <Card key={group.make} className="gap-0 py-0">
                <CardHeader className="border-secondary-100/60 flex flex-row items-center justify-between border-b px-4 py-3">
                  <CardTitle className="typo-subtitle text-carbon-500">
                    {group.make}
                    <span className="typo-sm-text text-carbon-200 ml-2 font-normal">{fullGroup.models.length}</span>
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openCreate(group.make)}
                    className="text-primary-700 cursor-pointer gap-1"
                  >
                    <Plus className="size-4" /> Modelo
                  </Button>
                </CardHeader>
                <ul className="divide-secondary-100/50 divide-y">
                  {group.models.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <span className="typo-text text-carbon-500 min-w-0 truncate">{item.model}</span>
                      <span className="flex items-center gap-2">
                        <span className="typo-numbers bg-surface-600/60 text-carbon-400 rounded px-2 py-0.5 text-xs">
                          {item.abbreviation}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Eliminar ${group.make} ${item.model}`}
                          onClick={() =>
                            setToDelete({
                              id: item.id,
                              make: group.make,
                              model: item.model,
                              isLastOfMake: fullGroup.models.length === 1,
                            })
                          }
                          className="text-carbon-300 hover:text-error-700 size-8 cursor-pointer"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      )}

      <CreateModelDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initialMake={createMake}
        onCreated={() => router.refresh()}
      />
      <DeleteModelDialog target={toDelete} onClose={() => setToDelete(null)} />
    </div>
  );
};

export default ModelCatalogView;
