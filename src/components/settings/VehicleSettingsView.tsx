'use client';

import { useState } from 'react';
import { LucideIcon, ShieldCheck, Tags } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Insurance, VehicleModelGroup } from '@/types/vehicle';
import InsurancesPanel from './InsurancesPanel';
import ModelsPanel from './ModelsPanel';

export type VehicleSettingsTab = 'modelos' | 'aseguradoras';

type VehicleSettingsViewProps = {
  groups: VehicleModelGroup[];
  insurances: Insurance[];
  initialTab: VehicleSettingsTab;
};

type TabCardProps = {
  value: VehicleSettingsTab;
  icon: LucideIcon;
  title: string;
  description: string;
  count: number;
  active: boolean;
};

/** A tab rendered as a card: icon chip, title, one-line description and a count badge. */
const TabCard = ({ value, icon: Icon, title, description, count, active }: TabCardProps) => (
  <TabsTrigger
    value={value}
    className={cn(
      'group/card h-auto min-h-[72px] flex-none cursor-pointer justify-start gap-3.5 rounded-xl border px-4 py-3 text-left whitespace-normal shadow-none transition-all',
      'after:hidden',
      active
        ? 'border-primary-500 bg-primary-50 ring-primary-500/30 shadow-sm ring-1'
        : 'border-surface-700/25 hover:border-primary-300 hover:bg-primary-50/50 bg-white',
    )}
  >
    <span
      aria-hidden
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors',
        active ? 'bg-terciary-500 text-primary-100' : 'bg-primary-50 text-primary-700',
      )}
    >
      <Icon className="size-5" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="typo-bold-text text-carbon-500 block truncate">{title}</span>
      <span className="typo-sm-text text-carbon-300 block truncate">{description}</span>
    </span>
    <span
      className={cn(
        'typo-label font-numbers shrink-0 rounded-full px-3 py-0.5',
        active ? 'bg-terciary-500 text-primary-100' : 'bg-surface-600/60 text-carbon-500',
      )}
    >
      {count}
    </span>
  </TabsTrigger>
);

/** Settings for the vehicle module. The active tab is mirrored in `?tab=` (without a navigation) so it can be linked. */
const VehicleSettingsView = ({ groups, insurances, initialTab }: VehicleSettingsViewProps) => {
  const [tab, setTab] = useState<VehicleSettingsTab>(initialTab);

  const changeTab = (value: string) => {
    const next = value as VehicleSettingsTab;
    setTab(next);
    window.history.replaceState(null, '', `?tab=${next}`);
  };

  const modelCount = groups.reduce((sum, group) => sum + group.models.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="typo-title text-carbon-500">Configuración de coches</h1>
        <p className="typo-text text-carbon-300">
          Las opciones que aparecen al registrar un coche: marcas, modelos y aseguradoras.
        </p>
      </div>

      <Tabs value={tab} onValueChange={changeTab} className="gap-6">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-3 bg-transparent p-0 group-data-[orientation=horizontal]/tabs:h-auto sm:grid-cols-2 xl:max-w-4xl">
          <TabCard
            value="modelos"
            icon={Tags}
            title="Marcas y modelos"
            description="Catálogo y abreviaturas de folio"
            count={modelCount}
            active={tab === 'modelos'}
          />
          <TabCard
            value="aseguradoras"
            icon={ShieldCheck}
            title="Aseguradoras"
            description="Contacto y coches asegurados"
            count={insurances.length}
            active={tab === 'aseguradoras'}
          />
        </TabsList>
        <TabsContent value="modelos">
          <ModelsPanel groups={groups} />
        </TabsContent>
        <TabsContent value="aseguradoras">
          <InsurancesPanel insurances={insurances} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleSettingsView;
