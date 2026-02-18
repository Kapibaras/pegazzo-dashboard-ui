'use client';

const GlobalError = ({ reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-[#0a192b] p-6">
        <div className="flex max-w-md flex-col items-center gap-6 rounded-lg bg-white p-10 text-center shadow-md">
          <div className="flex size-14 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
            !
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-gray-900">Error inesperado</h1>
            <p className="text-sm text-gray-500">
              Ocurrio un error inesperado en la aplicacion. Por favor, intenta de nuevo.
            </p>
          </div>
          <button
            onClick={() => { window.location.reload(); }}
            className="cursor-pointer rounded-md bg-[#0a192b] px-8 py-3 text-sm font-semibold text-white hover:bg-[#112d4e]"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
