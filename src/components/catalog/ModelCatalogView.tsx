'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Layers, PlusCircle, Search, Tags, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CreateModelDialog } from '@/components/vehicles/QuickCreateDialogs';
import VehicleStatCard from '@/components/vehicles/VehicleStatCard';
import { BUTTON_ICON_CLASS, outlineButton, primaryButton } from '@/lib/buttonStyles';
import { searchFieldClass } from '@/lib/formField';
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
  const largest = groups.reduce<VehicleModelGroup | null>(
    (best, group) => (!best || group.models.length > best.models.length ? group : best),
    null,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Button asChild variant="outline" className={outlineButton('min-h-9 px-4 py-2')}>
            <Link href="/coches">
              <ArrowLeft className="size-4" aria-hidden /> Coches
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="typo-title text-carbon-500">Catálogo de marcas y modelos</h1>
            <p className="typo-text text-carbon-300">
              Las opciones que aparecen al registrar un coche y con las que se arma su folio.
            </p>
          </div>
        </div>
        <Button onClick={() => openCreate()} className={primaryButton()}>
          <PlusCircle className={BUTTON_ICON_CLASS} aria-hidden />
          Agregar modelo
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <VehicleStatCard
          icon={Tags}
          label="Marcas"
          value={groups.length}
          chipClassName="bg-primary-100 text-primary-800"
        />
        <VehicleStatCard
          icon={Layers}
          label="Modelos"
          value={modelCount}
          chipClassName="bg-success-50 text-success-700"
        />
        <VehicleStatCard
          icon={Tags}
          label="Marca con más modelos"
          value={largest?.make ?? '—'}
          hint={largest ? `${largest.models.length} ${largest.models.length === 1 ? 'modelo' : 'modelos'}` : undefined}
          chipClassName="bg-warning-100 text-warning-700"
        />
      </div>

      <div className="relative w-full max-w-md">
        <Search className="text-carbon-200 absolute top-1/2 left-4 size-4 -translate-y-1/2" aria-hidden />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar marca o modelo..."
          aria-label="Buscar marca o modelo"
          className={searchFieldClass()}
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
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((group) => {
            const fullGroup = groups.find((item) => item.make === group.make) ?? group;
            return (
              <section
                key={group.make}
                className="border-surface-700/25 flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <header className="from-secondary-500 to-secondary-600 flex items-center gap-3 bg-gradient-to-b px-4 py-3.5">
                  <span
                    aria-hidden
                    className="bg-primary-500/20 text-primary-100 typo-bold-text flex size-10 shrink-0 items-center justify-center rounded-lg"
                  >
                    {group.make.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="typo-subtitle text-primary-100 truncate">{group.make}</h2>
                    <p className="typo-sm-text text-primary-100/70">
                      {fullGroup.models.length} {fullGroup.models.length === 1 ? 'modelo' : 'modelos'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => openCreate(group.make)}
                    className="typo-button text-primary-100 min-h-9 cursor-pointer gap-1.5 bg-white/10 px-3 py-2 hover:bg-white/20"
                  >
                    <PlusCircle className="size-4" aria-hidden /> Modelo
                  </Button>
                </header>

                <ul className="divide-surface-700/15 divide-y">
                  {group.models.map((item) => (
                    <li
                      key={item.id}
                      className="hover:bg-primary-50/60 flex items-center justify-between gap-3 px-4 py-3 transition-colors"
                    >
                      <span className="typo-bold-text text-carbon-500 min-w-0 truncate">{item.model}</span>
                      <span className="flex items-center gap-2">
                        <span
                          title="Abreviatura para el folio"
                          className="typo-label bg-primary-50 text-primary-800 border-primary-100 font-numbers rounded-md border px-2.5 py-0.5"
                        >
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
                          className="text-carbon-300 hover:bg-error-50 hover:text-error-700 size-9 cursor-pointer"
                        >
                          <Trash2 className="size-[18px]" />
                        </Button>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
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
