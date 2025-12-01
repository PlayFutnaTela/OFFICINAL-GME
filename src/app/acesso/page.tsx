'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateInvite } from '@/actions/invites';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AcessoPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await validateInvite(code);

      if (!result.valid) {
        setError(result.error || 'Código inválido');
        return;
      }

      // Redirecionar para formulário de aplicação
      router.push(`/acesso/aplicar/${code.toUpperCase()}`);
    } catch (err) {
      setError('Erro ao validar código. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">GEREZIM</h1>
          <p className="text-gray-400">Acesso Exclusivo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Código de Convite</label>
            <Input
              type="text"
              placeholder="GZM-XXXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={loading}
              className="bg-gray-800 border-gray-700"
            />
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <Button
            type="submit"
            disabled={loading || !code}
            className="w-full bg-white text-black hover:bg-gray-200"
          >
            {loading ? 'Validando...' : 'Continuar'}
          </Button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          Você recebeu um código de convite por email ou WhatsApp?
        </p>
      </div>
    </div>
  );
}
