import { UserPreferencesForm } from '@/components/user-preferences-form'
import { Card } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export const metadata = {
  title: 'Minhas Preferências - GEREZIM',
  description: 'Configure suas preferências para receber recomendações personalizadas',
}

export default function PreferencesPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-6 h-6 text-yellow-500" />
          <h1 className="text-3xl font-bold tracking-tight">Suas Preferências</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Configure como você deseja receber recomendações personalizadas de oportunidades.
        </p>
      </div>

      <UserPreferencesForm />

      <Card className="p-6 bg-yellow-50 border border-white shadow-lg shadow-yellow-200/50 hover:shadow-xl hover:shadow-yellow-300/60 transition-shadow duration-300 hover:translate-y-[-2px] transition-transform max-w-2xl">
        <h3 className="font-semibold text-gray-900 mb-2">💡 Como funciona o Match Inteligente?</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            <strong>Análise Contínua:</strong> Nosso sistema analisa novos produtos contra suas
            preferências em tempo real.
          </li>
          <li>
            <strong>Score de Compatibilidade:</strong> Cada oportunidade recebe um score de 0-100
            que indica o quanto se alinha com seu perfil.
          </li>
          <li>
            <strong>Notificações Inteligentes:</strong> Você só recebe notificações quando
            encontramos uma oportunidade com compatibilidade {'>='}65%.
          </li>
          <li>
            <strong>Melhoria Contínua:</strong> Quanto mais você interage com as oportunidades,
            melhor nosso sistema fica em recomendações.
          </li>
        </ul>
      </Card>

      <Card className="p-6 bg-yellow-50 border border-white shadow-lg shadow-yellow-200/50 hover:shadow-xl hover:shadow-yellow-300/60 transition-shadow duration-300 hover:translate-y-[-2px] transition-transform max-w-2xl">
        <h3 className="font-semibold text-gray-900 mb-2">✨ Benefícios das Preferências</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            🎯 <strong>Recomendações Personalizadas:</strong> Receba oportunidades que realmente
            combinam com você.
          </li>
          <li>
            ⏰ <strong>Economia de Tempo:</strong> Não precisa procurar - nós buscamos para você.
          </li>
          <li>
            📧 <strong>Notificações Relevantes:</strong> Apenas oportunidades que fazem sentido
            para seu perfil.
          </li>
          <li>
            📈 <strong>Melhor Experiência:</strong> Quanto mais complete suas preferências, melhor
            os resultados.
          </li>
        </ul>
      </Card>
    </div>
  )
}
