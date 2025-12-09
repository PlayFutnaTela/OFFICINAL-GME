import { createClient } from '@/lib/supabase/server'
import { getUserProfile, Product } from '@/lib/matching-engine'
import { calculateHybridMatch } from '@/lib/hybrid-matching'
import { sendMatchNotification } from '@/actions/send-match-notification'

export const runtime = 'nodejs'

/**
 * Cron job diário para encontrar matches e enviar notificações
 * 
 * Configuração recomendada no Vercel:
 * - Horário: 08:00 UTC (adjustar conforme timezone)
 * - Frequência: Daily
 * 
 * Chamada: GET /api/cron/matching
 * Headers: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  try {
    // 1. Validar token CRON_SECRET
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('CRON_SECRET não configurada')
      return Response.json(
        { error: 'CRON_SECRET não configurada' },
        { status: 500 }
      )
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Autorização inválida' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    if (token !== cronSecret) {
      return Response.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // 2. Conectar ao Supabase (usando service role para acesso completo)
    const supabase = createClient()

    // 3. Buscar usuários com notificações ativadas
    console.log('🔍 Buscando usuários com notificações ativadas...')

    const { data: usersData, error: usersError } = await supabase
      .from('user_preferences')
      .select('user_id')
      .eq('notifications_enabled', true)
      .limit(100)

    if (usersError) {
      throw usersError
    }

    if (!usersData || usersData.length === 0) {
      return Response.json({
        success: true,
        message: 'Nenhum usuário com notificações ativadas',
        users_processed: 0,
        matches_found: 0,
      })
    }

    const userIds = usersData.map((u) => u.user_id)
    console.log(`✅ ${userIds.length} usuários encontrados`)

    // 4. Buscar produtos criados nas últimas 24 horas
    console.log('🔍 Buscando produtos das últimas 24 horas...')

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .gte('created_at', oneDayAgo)
      .eq('status', 'ativo')
      .limit(50)

    if (productsError) {
      throw productsError
    }

    if (!productsData || productsData.length === 0) {
      return Response.json({
        success: true,
        message: 'Nenhum produto novo nas últimas 24 horas',
        users_processed: 0,
        matches_found: 0,
      })
    }

    console.log(`✅ ${productsData.length} produtos novos encontrados`)

    // 5. Para cada usuário, calcular matches contra produtos
    let totalMatches = 0
    let successfulMatches = 0
    let failedMatches = 0

    for (const userId of userIds) {
      try {
        // Obter preferências do usuário
        const userProfile = await getUserProfile(userId)

        if (!userProfile) {
          console.warn(`⚠️ Perfil não encontrado para ${userId}`)
          continue
        }

        // Calcular match para cada produto
        for (const product of productsData) {
          try {
            const match = await calculateHybridMatch(userProfile, product as Product)

            // Se score >= 65, enviar notificação
            if (match.shouldNotify) {
              totalMatches++

              const notificationResult = await sendMatchNotification({
                userId,
                productId: product.id,
                matchScore: match.score,
                reasons: match.reasons,
                product: product as Product,
              })

              if (notificationResult.success) {
                successfulMatches++
                console.log(
                  `✅ Match enviado: ${userId} x ${product.id} (score: ${match.score})`
                )
              } else {
                failedMatches++
                console.warn(
                  `❌ Falha ao enviar match: ${userId} x ${product.id}`
                )
              }
            }
          } catch (error) {
            failedMatches++
            console.error(`❌ Erro ao processar match ${userId} x ${product.id}:`, error)
          }
        }
      } catch (error) {
        console.error(`❌ Erro ao processar usuário ${userId}:`, error)
      }
    }

    // 6. Retornar resultado
    const result = {
      success: true,
      message: `Processamento concluído`,
      users_processed: userIds.length,
      products_analyzed: productsData.length,
      total_combinations: userIds.length * productsData.length,
      matches_found: totalMatches,
      successful_notifications: successfulMatches,
      failed_notifications: failedMatches,
      timestamp: new Date().toISOString(),
    }

    console.log('✅ Cron job concluído:', result)

    return Response.json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Erro crítico no cron job:', errorMessage)

    return Response.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
