export default function NotFound() {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900">Página não encontrada</h1>
          <p className="text-slate-600">A página solicitada não existe ou foi movida.</p>
          <a href="/" className="text-blue-600 hover:underline">Voltar para o início</a>
        </div>
      </body>
    </html>
  )
}
