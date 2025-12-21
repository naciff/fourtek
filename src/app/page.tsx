export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-10 text-center">
      <h1 className="text-4xl font-bold text-brand-blue-800">Fourtek Sync</h1>
      <p className="text-xl text-gray-700 max-w-md">
        Sistema de Gestão Operacional e Administrativa.
      </p>
      <div className="bg-brand-blue-50 p-6 rounded-xl border border-brand-blue-100 mt-4">
        <p className="text-sm text-brand-blue-600 font-medium mb-4">
          Acesse sua conta para continuar
        </p>
        <a
          href="/login"
          className="inline-block rounded-lg bg-brand-green-600 hover:bg-brand-green-700 transition-all px-10 py-3 text-white font-bold shadow-lg"
        >
          Entrar no Sistema
        </a>
      </div>
      <p className="text-xs text-gray-400 mt-10">
        Se você está vendo esta página, o Deploy foi bem-sucedido.
      </p>
    </div>
  );
}