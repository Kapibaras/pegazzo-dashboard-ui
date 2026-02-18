import Link from 'next/link';

const NotFound = () => {
  return (
    <div className="bg-surface-500 flex min-h-screen items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <p className="text-8xl font-bold text-muted-foreground">404</p>
        <div className="space-y-2">
          <h1 className="typo-subtitle">Pagina no encontrada</h1>
          <p className="typo-sm-text text-muted-foreground">La pagina que buscas no existe o fue movida.</p>
        </div>
        <Link
          href="/"
          className="bg-terciary-500 hover:bg-primary-700 text-primary-100 typo-bold-text cursor-pointer rounded-md px-12 py-3 hover:shadow-sm"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
