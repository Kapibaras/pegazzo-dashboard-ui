'use client';

const GlobalError = () => {
  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-[#0a192b] p-6">
        <div className="flex max-w-md flex-col items-center gap-6 rounded-lg bg-white p-10 text-center shadow-md">
          <div className="typo-title flex size-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>
          <div className="space-y-2">
            <h1 className="typo-subtitle text-carbon-500">Error inesperado</h1>
            <p className="typo-sm-text text-carbon-300">
              Ocurrio un error inesperado en la aplicacion. Por favor, intenta de nuevo.
            </p>
          </div>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="typo-label cursor-pointer rounded-md bg-[#0a192b] px-8 py-3 text-white hover:bg-[#112d4e]"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
