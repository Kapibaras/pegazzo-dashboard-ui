import { Building2, CarFront, CircleDollarSign, House } from 'lucide-react';

const routes = [
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
      { title: 'Configuración', url: '/#' },
    ],
  },
];

export default routes;
export type RoutesType = typeof routes;
