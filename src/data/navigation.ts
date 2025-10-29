import { Role } from '@/lib/schemas/userSchema';
import { Building2, CarFront, CircleDollarSign, House } from 'lucide-react';

const ROUTES_WITH_ICONS = [
  {
    title: 'Inicio',
    icon: House,
    url: '/',
    allowed: [Role.OWNER, Role.ADMIN, Role.EMPLOYEE],
  },
  {
    title: 'Balance',
    icon: CircleDollarSign,
    url: '/#',
    allowed: [Role.OWNER, Role.ADMIN],
  },
  {
    title: 'Coches',
    icon: CarFront,
    url: '/#',
    allowed: [Role.OWNER, Role.ADMIN, Role.EMPLOYEE],
  },
  {
    title: 'Organización',
    icon: Building2,
    subroutes: [
      { title: 'Usuarios', url: '/usuarios' },
      { title: 'Configuración', url: '#' },
    ],
    allowed: [Role.OWNER],
  },
];

const ROUTES_PATHNAMES: Record<string, string> = {
  '/': 'Inicio',
  '/usuarios': 'Usuarios',
  '/settings': 'Configuración',
};

export { ROUTES_WITH_ICONS, ROUTES_PATHNAMES };

export type RoutesType = typeof ROUTES_WITH_ICONS;
