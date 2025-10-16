import { Building2, CarFront, CircleDollarSign, House } from 'lucide-react';

const ROUTES_WITH_ICONS = [
  {
    title: 'Inicio',
    icon: House,
    url: '/',
  },
  {
    title: 'Balance',
    icon: CircleDollarSign,
    url: '/#',
  },
  {
    title: 'Coches',
    icon: CarFront,
    url: '/#',
  },
  {
    title: 'Organización',
    icon: Building2,
    subroutes: [
      { title: 'Usuarios', url: '/usuarios' },
      { title: 'Configuración', url: '#' },
    ],
  },
];

const ROUTES_PATHNAMES: Record<string, string> = {
  '/': 'Inicio',
  '/usuarios': 'Usuarios',
  '/settings': 'Configuración',
};

export { ROUTES_WITH_ICONS, ROUTES_PATHNAMES };

export type RoutesType = typeof ROUTES_WITH_ICONS;
