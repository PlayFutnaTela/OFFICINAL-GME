'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateInvite, createPendingMember } from '@/actions/invites';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';

export default function AplicarPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [codeValid, setCodeValid] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interests: [] as string[],
  });

  // Validar código ao carregar
  useEffect(() => {
    const validate = async () => {
      try {
        const result = await validateInvite(params.code);
        setCodeValid(result.valid);
        if (!result.valid) {
          setError(result.error || 'Código inválido');
        }
      } catch (err) {
        setError('Erro ao validar código');
      } finally {
        setValidating(false);
      }
    };

    validate();
  }, [params.code]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createPendingMember({
        code: params.code,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        extra_info: { interests: formData.interests },
      });

      setSuccess(true);
      setTimeout(() => router.push('/'), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar formulário');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex items-center justify-center">
        <p>Validando código...</p>
      </div>
    );
  }

  if (!codeValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Código Inválido</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <Button onClick={() => router.push('/acesso')} className="bg-white text-black">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">✅ Sucesso!</h1>
          <p className="text-gray-400 mb-8">
            Sua solicitação foi recebida. O administrador entrará em contato em breve.
          </p>
          <p className="text-sm text-gray-500">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Complete seu Registro</h1>
          <p className="text-gray-400">Código: {params.code}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nome Completo *</label>
            <Input
              type="text"
              name="name"
              placeholder="João Silva"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <Input
              type="email"
              name="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">WhatsApp</label>
            <Input
              type="tel"
              name="phone"
              placeholder="+55 11 99999-9999"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={loading}
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Interesses (opcional)</label>
            <div className="space-y-2">
              {['Carros', 'Imóveis', 'Empresas', 'Premium'].map((interest) => (
                <label key={interest} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleInterestToggle(interest)}
                    disabled={loading}
                    className="mr-3"
                  />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <Button
            type="submit"
            disabled={loading || !formData.name || !formData.email}
            className="w-full bg-white text-black hover:bg-gray-200"
          >
            {loading ? 'Enviando...' : 'Enviar Solicitação'}
          </Button>
        </form>
      </div>
    </div>
  );
}
