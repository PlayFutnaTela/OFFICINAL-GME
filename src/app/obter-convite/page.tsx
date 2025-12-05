'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitInviteRequest } from '@/actions/invite-request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ObterConvitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    motivo: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await submitInviteRequest(
        formData.nome,
        formData.email,
        formData.whatsapp,
        formData.motivo
      );

      if (result.success) {
        setShowSuccess(true);
        setFormData({ nome: '', email: '', whatsapp: '', motivo: '' });
      } else {
        setError(result.error || 'Erro ao enviar solicitação');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccess(false);
    router.push('/oportunidades');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {!showSuccess ? (
          <>
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">GEREZIM</h1>
              <p className="text-gray-400">Solicitar Acesso</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900/20 border border-red-700 rounded p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Nome */}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium mb-2">
                  Nome Completo
                </label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="João Silva"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="joao@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium mb-2">
                  WhatsApp
                </label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  placeholder="11 99999-9999"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Formato: 11 dígitos (ex: 11 99999-9999)</p>
              </div>

              {/* Motivo */}
              <div>
                <label htmlFor="motivo" className="block text-sm font-medium mb-2">
                  Por que deseja um convite?
                </label>
                <textarea
                  id="motivo"
                  name="motivo"
                  placeholder="Conte-nos por que você está interessado em entrar para a Gerezim..."
                  value={formData.motivo}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 resize-none"
                />
              </div>

              {/* Botão Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-2 px-4 rounded hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>

              {/* Link para login */}
              <p className="text-center text-sm text-gray-400">
                Já tem um convite?{' '}
                <a href="/auth/register" className="text-green-400 hover:text-green-300">
                  Validar aqui
                </a>
              </p>
            </form>
          </>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-600 rounded-lg p-8 text-center space-y-4">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-400">Solicitação Encaminhada!</h2>
              <p className="text-gray-300">
                Recebemos sua solicitação e estamos analisando. Você receberá uma resposta em até{' '}
                <span className="font-bold text-green-400">2 dias úteis</span>.
              </p>
              <p className="text-sm text-gray-400">
                Acompanhe seu email para atualizações sobre sua solicitação.
              </p>
            </div>

            <Button
              onClick={handleSuccessOk}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-2 px-4 rounded hover:from-green-600 hover:to-green-700 transition"
            >
              Ok, Continuar para Oportunidades
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
