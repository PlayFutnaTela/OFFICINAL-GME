'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Settings, Save } from 'lucide-react'

const CATEGORIES = [
  'Aeronaves',
  'Embarcações',
  'Veículos de Luxo',
  'Imóveis',
  'Investimentos',
  'Arte e Colecionáveis',
  'Joias e Acessórios',
  'Experiências Exclusivas',
  'Memberships',
]

const LOCATIONS = [
  'São Paulo',
  'Rio de Janeiro',
  'Brasília',
  'Salvador',
  'Recife',
  'Fortaleza',
  'Belo Horizonte',
  'Curitiba',
]

const URGENCY_LEVELS = [
  { value: 'low', label: '🐢 Baixa - Procuro com calma' },
  { value: 'normal', label: '👤 Normal - Procuro ocasionalmente' },
  { value: 'high', label: '🔥 Alta - Procuro ativamente' },
]

const NOTIFICATION_FREQUENCIES = [
  { value: 'immediate', label: '⚡ Imediato - Assim que houver match' },
  { value: 'daily', label: '📅 Diariamente - Resumo matinal' },
  { value: 'weekly', label: '📆 Semanalmente - Resumo semanal' },
  { value: 'never', label: '🔕 Nunca - Desativar notificações' },
]

interface UserPreferences {
  interests: string[]
  min_price: number
  max_price: number
  preferred_locations: string[]
  urgency_level: 'low' | 'normal' | 'high'
  notification_frequency: 'immediate' | 'daily' | 'weekly' | 'never'
  notifications_enabled: boolean
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
}

/**
 * Componente: Formulário de Preferências do Usuário
 * Permite que o usuário configure suas preferências de matching
 */
export function UserPreferencesForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    interests: [],
    min_price: 0,
    max_price: 1000000,
    preferred_locations: [],
    urgency_level: 'normal',
    notification_frequency: 'daily',
    notifications_enabled: true,
    email_notifications: true,
    push_notifications: false,
    sms_notifications: false,
  })

  useEffect(() => {
    fetchPreferences()
  }, [])

  async function fetchPreferences() {
    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Usuário não autenticado')
        return
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setPreferences({
          interests: data.interests || [],
          min_price: data.min_price || 0,
          max_price: data.max_price || 1000000,
          preferred_locations: data.preferred_locations || [],
          urgency_level: data.urgency_level || 'normal',
          notification_frequency: data.notification_frequency || 'daily',
          notifications_enabled: data.notifications_enabled ?? true,
          email_notifications: data.email_notifications ?? true,
          push_notifications: data.push_notifications ?? false,
          sms_notifications: data.sms_notifications ?? false,
        })
      }
    } catch (error) {
      console.error('Erro ao buscar preferências:', error)
      toast.error('Erro ao carregar preferências')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Usuário não autenticado')
        return
      }

      const { error } = await supabase.from('user_preferences').upsert(
        {
          user_id: user.id,
          interests: preferences.interests,
          min_price: preferences.min_price,
          max_price: preferences.max_price,
          preferred_locations: preferences.preferred_locations,
          urgency_level: preferences.urgency_level,
          notification_frequency: preferences.notification_frequency,
          notifications_enabled: preferences.notifications_enabled,
          email_notifications: preferences.email_notifications,
          push_notifications: preferences.push_notifications,
          sms_notifications: preferences.sms_notifications,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      )

      if (error) throw error

      toast.success('✅ Preferências salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
      toast.error('Erro ao salvar preferências')
    } finally {
      setSaving(false)
    }
  }

  function toggleCategory(category: string) {
    setPreferences((prev) => ({
      ...prev,
      interests: prev.interests.includes(category)
        ? prev.interests.filter((c) => c !== category)
        : [...prev.interests, category],
    }))
  }

  function toggleLocation(location: string) {
    setPreferences((prev) => ({
      ...prev,
      preferred_locations: prev.preferred_locations.includes(location)
        ? prev.preferred_locations.filter((l) => l !== location)
        : [...prev.preferred_locations, location],
    }))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Seção: Categorias de Interesse */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Categorias de Interesse
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Selecione as categorias que mais te interessam para receber recomendações personalizadas
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CATEGORIES.map((category) => (
            <label key={category} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.interests.includes(category)}
                onChange={() => toggleCategory(category)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Seção: Faixa de Preço */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Faixa de Preço</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço Mínimo
            </label>
            <input
              type="number"
              value={preferences.min_price}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  min_price: Number(e.target.value),
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço Máximo
            </label>
            <input
              type="number"
              value={preferences.max_price}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  max_price: Number(e.target.value),
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Seção: Localizações Preferidas */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Localizações Preferidas
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Selecione as regiões onde deseja receber oportunidades
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LOCATIONS.map((location) => (
            <label key={location} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.preferred_locations.includes(location)}
                onChange={() => toggleLocation(location)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-gray-700">{location}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Seção: Nível de Urgência */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Nível de Urgência</h2>
        <p className="text-sm text-gray-600 mb-4">
          Isso ajuda a priorizar as recomendações que você recebe
        </p>
        <div className="space-y-2">
          {URGENCY_LEVELS.map((level) => (
            <label key={level.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="urgency"
                value={level.value}
                checked={preferences.urgency_level === level.value}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    urgency_level: e.target.value as any,
                  }))
                }
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">{level.label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Seção: Frequência de Notificações */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Frequência de Notificações
        </h2>
        <div className="space-y-2">
          {NOTIFICATION_FREQUENCIES.map((freq) => (
            <label key={freq.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="frequency"
                value={freq.value}
                checked={preferences.notification_frequency === freq.value}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    notification_frequency: e.target.value as any,
                  }))
                }
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">{freq.label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Seção: Canais de Notificação */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Canais de Notificação</h2>
        <p className="text-sm text-gray-600 mb-4">
          Escolha como você quer ser notificado sobre oportunidades
        </p>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email_notifications}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  email_notifications: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-gray-700">📧 Email</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer opacity-50">
            <input
              type="checkbox"
              checked={preferences.push_notifications}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  push_notifications: e.target.checked,
                }))
              }
              disabled
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-gray-700">📱 Push (em breve)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer opacity-50">
            <input
              type="checkbox"
              checked={preferences.sms_notifications}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  sms_notifications: e.target.checked,
                }))
              }
              disabled
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-gray-700">💬 SMS (em breve)</span>
          </label>
        </div>
      </Card>

      {/* Botão de Salvar */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </Card>

      {/* Informação sobre matches */}
      <Card className="p-4 bg-gray-50 border-gray-200">
        <p className="text-sm text-gray-600">
          💡 Com base em suas preferências, você receberá recomendações personalizadas de oportunidades
          que se alinham com seus interesses. Quanto mais específicas suas preferências, melhores serão
          as recomendações.
        </p>
      </Card>
    </div>
  )
}
