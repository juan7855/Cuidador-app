"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="app-bg flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-extrabold text-slate-900">
        No pudimos cargar la información
      </h1>
      <p className="max-w-sm text-sm font-medium text-slate-500">
        Revisa la conexión con la base de datos e inténtalo de nuevo.
      </p>
      <button onClick={reset} className="btn-primary">
        Reintentar
      </button>
    </div>
  );
}
