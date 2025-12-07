"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'
import { submitSolicitacaoPedido } from '@/actions/solicitar-pedido'

type FormData = {
  title: string
  description: string
  specifications: string
  category: string
  budget: string
  location: string
  contact_preference: string
  additional_notes: string
}

const CATEGORIES = [
  { value: 'carros', label: 'Carros de Luxo' },
  { value: 'imoveis', label: 'Imóveis' },
  { value: 'empresas', label: 'Empresas' },
  { value: 'cartas', label: 'Cartas Contempladas' },
  { value: 'eletronicos', label: 'Eletrônicos' },
  { value: 'embarcacoes', label: 'Embarcações' },
  { value: 'industrias', label: 'Indústrias' },
  { value: 'premium', label: 'Premium' },
  { value: 'outros', label: 'Outros' },
]

const CONTACT_PREFERENCES = [
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'qualquer', label: 'Qualquer um' },
]

export default function SolicitarPedidoPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    specifications: '',
    category: '',
    budget: '',
    location: '',
    contact_preference: 'email',
    additional_notes: '',
  })

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('Por favor, descreva o item que está procurando')
      return false
    }
    if (!formData.description.trim()) {
      toast.error('Por favor, forneça mais detalhes sobre o que você deseja')
      return false
    }
    if (!formData.category) {
      toast.error('Por favor, selecione uma categoria')
      return false
    }
    if (!formData.budget.trim()) {
      toast.error('Por favor, indique o orçamento estimado')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const result = await submitSolicitacaoPedido(formData)

      if (result.success) {
        toast.success(result.message)
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          specifications: '',
          category: '',
          budget: '',
          location: '',
          contact_preference: 'email',
          additional_notes: '',
        })
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error)
      toast.error('Erro ao enviar solicitação. Por favor, tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Solicitar Pedido</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Não encontrou o que procura em nosso catálogo? Nos conte! Nossos especialistas procurarão o item perfeito para você.
        </p>
      </div>

      {/* Form Card */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Detalhes da Solicitação</CardTitle>
          <CardDescription>
            Preencha os campos abaixo com o máximo de informações possível para nos ajudar a encontrar exatamente o que você deseja.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* O que você está procurando */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">
                O que você está procurando? *
              </Label>
              <Input
                id="title"
                placeholder="Ex: BMW M5 2023, Apartamento no Jardim Paulista, etc"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                disabled={loading}
                className="border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-500"
              />
            </div>

            {/* Descrição detalhada */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                Descrição Detalhada *
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva em detalhes o que você está procurando, incluindo características importantes..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={loading}
                rows={4}
                className="border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-500"
              />
            </div>

            {/* Especificações */}
            <div className="space-y-2">
              <Label htmlFor="specifications" className="text-gray-700 dark:text-gray-300">
                Especificações Técnicas
              </Label>
              <Textarea
                id="specifications"
                placeholder="Ex: Cor, tamanho, modelo, ano, marcas preferidas, etc..."
                value={formData.specifications}
                onChange={(e) => handleChange('specifications', e.target.value)}
                disabled={loading}
                rows={3}
                className="border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-500"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">
                Categoria *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)} disabled={loading}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-500">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Orçamento */}
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-gray-700 dark:text-gray-300">
                Orçamento Estimado *
              </Label>
              <Input
                id="budget"
                placeholder="Ex: R$ 100.000 - R$ 500.000"
                value={formData.budget}
                onChange={(e) => handleChange('budget', e.target.value)}
                disabled={loading}
                className="border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-500"
              />
            </div>

            {/* Localização */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">
                Localização Preferida
              </Label>
              <Input
                id="location"
                placeholder="Ex: São Paulo, SP ou qualquer localização"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                disabled={loading}
                className="border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-500"
              />
            </div>

            {/* Preferência de Contato */}
            <div className="space-y-2">
              <Label htmlFor="contact" className="text-gray-700 dark:text-gray-300">
                Preferência de Contato
              </Label>
              <Select value={formData.contact_preference} onValueChange={(value) => handleChange('contact_preference', value)} disabled={loading}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_PREFERENCES.map(pref => (
                    <SelectItem key={pref.value} value={pref.value}>
                      {pref.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Observações Adicionais */}
            <div className="space-y-2">
              <Label htmlFor="additional" className="text-gray-700 dark:text-gray-300">
                Observações Adicionais
              </Label>
              <Textarea
                id="additional"
                placeholder="Alguma informação adicional que possa ser útil?"
                value={formData.additional_notes}
                onChange={(e) => handleChange('additional_notes', e.target.value)}
                disabled={loading}
                rows={2}
                className="border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-8 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar Solicitação
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              * Campos obrigatórios. Seus dados serão utilizados apenas para processar sua solicitação.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 border-yellow-200 dark:border-gray-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-yellow-900 dark:text-yellow-300">Por que solicitar?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 dark:text-gray-300">
            <ul className="space-y-2 list-disc list-inside">
              <li>Acesso a itens não disponíveis publicamente</li>
              <li>Busca personalizada por especialistas</li>
              <li>Análise completa de mercado</li>
              <li>Negociação de melhor preço</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-blue-200 dark:border-gray-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-900 dark:text-blue-300">Próximos passos</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 dark:text-gray-300">
            <ol className="space-y-2 list-decimal list-inside">
              <li>Sua solicitação será analisada por nossos especialistas</li>
              <li>Você receberá contato em 24-48 horas</li>
              <li>Discutiremos opções disponíveis</li>
              <li>Finalizaremos a negociação</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
