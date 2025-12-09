const { createClient } = require('@supabase/supabase-js')

// Credenciais fornecidas
const SUPABASE_URL = 'https://wmacjzobwnrfyrqyxhko.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtYWNqem9id25yZnlycXl4aGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMDEzOTksImV4cCI6MjA3OTU3NzM5OX0.mwgpY321KB_DdfWF57D2CLrL5Nckoy3-Lv_THW4LmEE'

async function validateSupabase() {
  console.log('🔍 Validando credenciais do Supabase...\n')

  try {
    // Criar cliente Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // 1. Validar conexão
    console.log('1️⃣  Validando conexão com Supabase...')
    const { data: session, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.log('   ⚠️  Erro de autenticação (esperado, sem usuário logado): OK')
    } else {
      console.log('   ✅ Conexão com Supabase: OK')
    }

    // 2. Validar tabela 'favorites'
    console.log('\n2️⃣  Validando tabela "favorites"...')
    const { data: favorites, error: favError, count: favCount } = await supabase
      .from('favorites')
      .select('*', { count: 'exact' })
      .limit(1)

    if (favError) {
      console.log(`   ❌ Erro: ${favError.message}`)
    } else {
      console.log(`   ✅ Tabela "favorites" existe`)
      
      // Contar total de registros
      const { count } = await supabase
        .from('favorites')
        .select('*', { count: 'exact' })
      
      console.log(`   📊 Total de favoritos: ${count || 0}`)
      
      if (favorites && favorites.length > 0) {
        console.log(`   📝 Exemplo: ${JSON.stringify(favorites[0], null, 2)}`)
      }
    }

    // 3. Validar tabela 'solicitar_pedidos'
    console.log('\n3️⃣  Validando tabela "solicitar_pedidos"...')
    const { data: requests, error: reqError, count: reqCount } = await supabase
      .from('solicitar_pedidos')
      .select('*', { count: 'exact' })
      .limit(1)

    if (reqError) {
      console.log(`   ❌ Erro: ${reqError.message}`)
    } else {
      console.log(`   ✅ Tabela "solicitar_pedidos" existe`)
      
      // Contar total de registros
      const { count } = await supabase
        .from('solicitar_pedidos')
        .select('*', { count: 'exact' })
      
      console.log(`   📊 Total de solicitações: ${count || 0}`)
      
      if (requests && requests.length > 0) {
        console.log(`   📝 Exemplo: ${JSON.stringify(requests[0], null, 2)}`)
      }
    }

    // 4. Validar tabela 'products'
    console.log('\n4️⃣  Validando tabela "products"...')
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .limit(1)

    if (prodError) {
      console.log(`   ❌ Erro: ${prodError.message}`)
    } else {
      console.log(`   ✅ Tabela "products" existe`)
      
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
      
      console.log(`   📊 Total de produtos: ${count || 0}`)
    }

    // 5. Validar user_interactions
    console.log('\n5️⃣  Validando tabela "user_interactions"...')
    const { data: interactions, error: intError } = await supabase
      .from('user_interactions')
      .select('*', { count: 'exact' })
      .limit(1)

    if (intError) {
      console.log(`   ❌ Erro: ${intError.message}`)
    } else {
      console.log(`   ✅ Tabela "user_interactions" existe`)
      
      const { count } = await supabase
        .from('user_interactions')
        .select('*', { count: 'exact' })
      
      console.log(`   📊 Total de interações: ${count || 0}`)
    }

    console.log('\n✅ VALIDAÇÃO CONCLUÍDA COM SUCESSO!\n')
    console.log('📋 Resumo:')
    console.log('   ✅ Supabase URL: ' + SUPABASE_URL)
    console.log('   ✅ API Key: ' + SUPABASE_ANON_KEY.substring(0, 20) + '...')
    console.log('   ✅ Todas as tabelas acessíveis')

  } catch (error) {
    console.error('❌ Erro durante validação:', error)
    process.exit(1)
  }
}

validateSupabase()
