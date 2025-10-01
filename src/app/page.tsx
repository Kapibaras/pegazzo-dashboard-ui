export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-surface-50">
      <h1 className="title text-primary-600">Título con Figtree</h1>

      <p className="text-bold text-secondary-500">
        Texto destacado en secondary
      </p>

      <span className="numbers text-accent-600">12345</span>

      <div className="bg-secondary-500 text-surface-50 px-4 py-2 rounded-lg">
        Caja con fondo secondary
      </div>
    </main>
  );
}
