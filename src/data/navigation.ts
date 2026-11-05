import { Role } from '@/lib/schemas/userSchema';
import { Building2, CarFront, CircleDollarSign, Handshake, House, IdCard } from 'lucide-react';

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
    subroutes: [
      { title: 'Métricas Actuales', url: '/balance' },
      { title: 'Transacciones', url: '/balance/transacciones' },
      { title: 'Autorizaciones', url: '/balance/autorizaciones' },
    ],
    allowed: [Role.OWNER],
  },
  {
    title: 'Balance',
    icon: CircleDollarSign,
    url: '/balance/transacciones',
    allowed: [Role.ADMIN],
  },
  {
    title: 'Coches',
    icon: CarFront,
    url: '/coches',
    allowed: [Role.OWNER, Role.ADMIN, Role.EMPLOYEE],
  },
  {
    title: 'Conductores',
    icon: IdCard,
    url: '/conductores',
    allowed: [Role.OWNER, Role.ADMIN, Role.EMPLOYEE],
  },
  {
    title: 'Socios',
    icon: Handshake,
    url: '/socios',
    allowed: [Role.OWNER, Role.ADMIN],
  },
  {
    title: 'Organización',
    icon: Building2,
    subroutes: [
      { title: 'Usuarios', url: '/usuarios' },
      { title: 'Configuración', url: '/configuracion/coches' },
    ],
    allowed: [Role.OWNER],
  },
];

const ROUTES_PATHNAMES: Record<string, string> = {
  '/': 'Inicio',
  '/balance': 'Balance',
  '/balance/transacciones': 'Balance',
  '/balance/autorizaciones': 'Balance',
  '/coches': 'Coches',
  '/conductores': 'Conductores',
  '/socios': 'Socios',
  '/usuarios': 'Usuarios',
  '/configuracion/coches': 'Configuración',
};

/** Exact match first, then the longest registered prefix (so `/coches/ABC-1/editar` resolves to "Coches"). */
const getRouteTitle = (pathname: string): string => {
  if (ROUTES_PATHNAMES[pathname]) return ROUTES_PATHNAMES[pathname];

  const prefix = Object.keys(ROUTES_PATHNAMES)
    .filter((route) => route !== '/' && pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0];

  return prefix ? ROUTES_PATHNAMES[prefix] : 'Unknown';
};

export { ROUTES_WITH_ICONS, ROUTES_PATHNAMES, getRouteTitle };

export type RoutesType = typeof ROUTES_WITH_ICONS;
