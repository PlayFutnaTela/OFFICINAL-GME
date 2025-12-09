'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'
import { markMatchAsClicked } from '@/actions/send-match-notification'

interface Match {
  id: string
  product_id: string
  match_score: number
  match_reasons: string[]
  clicked: boolean
  user_id: string
  product_name?: string
  product_category?: string
  product_price?: number
}

/**
 * Componente: Oportunidades Recomendadas
 * Mostra os 5 principais matches personalizados para o usuário
 */
export function RecommendedOpportunities() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMatches()
  }, [])

  async function fetchMatches() {
    try {
      setLoading(true)
      const supabase = createClient()

      // Obter usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('Usuário não autenticado')
        return
      }

      // Buscar top 5 matches que não foram clicados, ordenados por score
      const { data, error } = await supabase
        .from('recommendation_matches')
        .select(
          `
          id,
          user_id,
          product_id,
          match_score,
          match_reasons,
          clicked,
          products!product_id(name, category, price)
        `
        )
        .eq('user_id', user.id)
        .eq('clicked', false)
        .order('match_score', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Erro ao buscar matches:', error)
        setError('Erro ao carregar recomendações')
        return
      }

      // Mapear estrutura de dados
      const mappedMatches = (data || []).map((match: any) => ({
        id: match.id,
        user_id: match.user_id,
        product_id: match.product_id,
        match_score: match.match_score,
        match_reasons: match.match_reasons || [],
        clicked: match.clicked,
        product_name: match.products?.name,
        product_category: match.products?.category,
        product_price: match.products?.price,
      }))

      setMatches(mappedMatches)
    } catch (err) {
      console.error('Erro ao buscar recomendações:', err)
      setError('Erro ao carregar recomendações')
    } finally {
      setLoading(false)
    }
  }

  async function handleMatchClick(match: Match) {
    try {
      // Marcar como clicado
      await markMatchAsClicked(match.user_id, match.product_id)

      // Atualizar estado local
      setMatches(matches.map((m) => (m.id === match.id ? { ...m, clicked: true } : m)))
    } catch (err) {
      console.error('Erro ao registrar clique:', err)
    }
  }

  // Loading state
  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Carregando recomendações...
          </h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded opacity-50" />
          ))}
        </div>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <p className="text-red-700">{error}</p>
      </Card>
    )
  }

  // Empty state
  if (matches.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Nenhuma recomendação no momento
          </h3>
        </div>
        <p className="text-gray-600 mb-4">
          Novas oportunidades compatíveis com seu perfil aparecerão aqui. Configure suas preferências
          para receber melhores recomendações.
        </p>
        <Link
          href="/dashboard/preferencias"
          className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Configurar Preferências
        </Link>
      </Card>
    )
  }

  // Matches found
  return (
    <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          Oportunidades Recomendadas
        </h3>
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <Link
            key={match.id}
            href={`/produto/${match.product_id}`}
            onClick={() => handleMatchClick(match)}
          >
            <div className="bg-white p-4 rounded-lg border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                    {match.product_name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {match.product_category} • R$ {match.product_price?.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ml-2">
                  {match.match_score}%
                </div>
              </div>

              {match.match_reasons.length > 0 && (
                <div className="text-xs text-gray-600 space-y-1">
                  {match.match_reasons.slice(0, 2).map((reason, i) => (
                    <p key={i}>• {reason}</p>
                  ))}
                  {match.match_reasons.length > 2 && (
                    <p className="italic">+{match.match_reasons.length - 2} razões mais</p>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-amber-200">
        <p className="text-xs text-gray-600">
          💡 Essas recomendações são baseadas em suas preferências. Clique para ver detalhes completos.
        </p>
      </div>
    </Card>
  )
}
