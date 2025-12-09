import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, FileText, TrendingUp, Calendar, Gift } from 'lucide-react'
import { RecommendedOpportunities } from '@/components/recommended-opportunities'
import { DashboardEmptyState } from '@/components/dashboard-empty-state'

export const metadata = {
  title: 'Meu Dashboard - GEREZIM',
  description: 'Acompanhe seus favoritos, solicitações e negociações',
}

export default async function BuyerDashboardPage() {
  const supabase = createClient()

  // Obter usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
  }

  // Buscar dados do comprador
  const [{ data: favorites }, { data: requests }, { data: negotiations }, { data: schedules }, { data: offers }] =
    await Promise.all([
      // Favoritos
      supabase
        .from('user_interactions')
        .select('product_id, products!inner(id, name, category, price, status)')
        .eq('user_id', user.id)
        .eq('interaction_type', 'saved')
        .limit(5),

      // Solicitações (do solicitar_pedidos)
      supabase
        .from('solicitar_pedidos')
        .select('id, product_id, status, created_at, title, description, category, products!inner(name, category)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),

      // Negociações (opportunities em negociação)
      supabase
        .from('opportunities')
        .select('id, product_id, status, value, pipeline_stage, products!inner(name, category)')
        .eq('user_id', user.id)
        .eq('status', 'em_negociacao')
        .order('created_at', { ascending: false })
        .limit(5),

      // Agendamentos
      supabase
        .from('opportunities')
        .select('id, product_id, closed_date, products!inner(name)')
        .eq('user_id', user.id)
        .not('closed_date', 'is', null)
        .gte('closed_date', new Date().toISOString())
        .order('closed_date', { ascending: true })
        .limit(5),

      // Ofertas enviadas
      supabase
        .from('opportunities')
        .select('id, product_id, value, status, products!inner(name, category)')
        .eq('user_id', user.id)
        .in('status', ['em_negociacao', 'finalizado'])
        .order('created_at', { ascending: false })
        .limit(5),
    ])

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Acompanhe seus favoritos, solicitações e negociações em tempo real
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favorites?.length || 0}</div>
            <p className="text-xs text-gray-500">Produtos salvos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitações</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests?.length || 0}</div>
            <p className="text-xs text-gray-500">Pedidos enviados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negociações</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{negotiations?.length || 0}</div>
            <p className="text-xs text-gray-500">Em progresso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules?.length || 0}</div>
            <p className="text-xs text-gray-500">Próximas datas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ofertas</CardTitle>
            <Gift className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offers?.length || 0}</div>
            <p className="text-xs text-gray-500">Ativas</p>
          </CardContent>
        </Card>
      </div>

      {/* Oportunidades Recomendadas */}
      <RecommendedOpportunities />

      {/* Seção: Itens Favoritos */}
      {favorites && favorites.length > 0 && (
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                Itens Favoritos ({favorites.length})
              </CardTitle>
              <a
                href="/favoritos"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver Todos →
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((fav: any) => (
                <a
                  key={fav.product_id}
                  href={`/produto/${fav.product_id}`}
                  className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors flex-1">
                      {fav.products?.name}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
                    {fav.products?.category}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    R$ {fav.products?.price?.toLocaleString('pt-BR')}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 group-hover:text-blue-800">
                    Ver Detalhes
                    <span>→</span>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção Vazia: Favoritos */}
      {(!favorites || favorites.length === 0) && (
        <DashboardEmptyState
          icon={Heart}
          title="Itens Favoritos"
          description="Comece a explorar e adicione seus produtos favoritos à lista"
          actionText="Explorar Oportunidades"
          actionHref="/oportunidades"
          borderColor="red"
        />
      )}

      {/* Seção: Solicitações Recentes */}
      {requests && requests.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Histórico de Solicitações ({requests.length})
              </CardTitle>
              <a
                href="/solicitar-pedido"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Nova Solicitação →
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests.map((req: any) => (
                <div
                  key={req.id}
                  className="p-4 border border-blue-100 rounded-lg hover:border-blue-300 hover:bg-blue-100/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{req.products?.[0]?.name || req.title}</h3>
                      <p className="text-sm text-gray-600">{req.products?.[0]?.category}</p>
                    </div>
                    <div
                      className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        req.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : req.status === 'aceito' || req.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : req.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {req.status === 'pending'
                        ? '⏳ Pendente'
                        : req.status === 'aceito' || req.status === 'accepted'
                          ? '✓ Aceito'
                          : req.status === 'rejected'
                            ? '✕ Rejeitado'
                            : req.status.toUpperCase()}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    📅 {new Date(req.created_at).toLocaleDateString('pt-BR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  {req.description && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">{req.description}</p>
                  )}
                  <a
                    href={`/solicitar-pedido/${req.id}`}
                    className="inline-flex text-sm text-blue-600 hover:text-blue-800 font-medium mt-1"
                  >
                    Ver Detalhes →
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção Vazia: Solicitações */}
      {(!requests || requests.length === 0) && (
        <DashboardEmptyState
          icon={FileText}
          title="Histórico de Solicitações"
          description="Não encontrou o que procura? Faça uma solicitação personalizada"
          actionText="Fazer Solicitação"
          actionHref="/solicitar-pedido"
          borderColor="blue"
        />
      )}

      {/* Seção: Negociações */}
      {negotiations && negotiations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Negociações em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {negotiations.map((neg: any) => (
                <div
                  key={neg.id}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{neg.products?.[0]?.name}</h3>
                    <p className="text-sm text-gray-600">{neg.products?.[0]?.category}</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      R$ {neg.value?.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Stage: {neg.pipeline_stage}</p>
                  </div>
                  <div className="ml-4 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {neg.pipeline_stage}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção: Agendamentos */}
      {schedules && schedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              Próximas Datas Agendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedules.map((sched: any) => (
                <div
                  key={sched.id}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{sched.products?.[0]?.name}</h3>
                    <p className="text-sm text-gray-600">
                      Data: {new Date(sched.closed_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="ml-4 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Agendado
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção: Ofertas */}
      {offers && offers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-yellow-500" />
              Suas Ofertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {offers.map((offer: any) => (
                <div
                  key={offer.id}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{offer.products?.[0]?.name}</h3>
                    <p className="text-sm text-gray-600">{offer.products?.[0]?.category}</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      R$ {offer.value?.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div
                    className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                      offer.status === 'em_negociacao'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {offer.status === 'em_negociacao' ? 'Negociando' : 'Finalizado'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
