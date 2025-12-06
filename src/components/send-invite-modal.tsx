'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAvailableInvites, sendInviteToClient } from '@/actions/send-invite';

interface Invite {
  id: string;
  code: string;
  category: string;
}

interface SendInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  nome: string;
  whatsapp: string;
  onSuccess?: () => void;
}

export function SendInviteModal({
  isOpen,
  onClose,
  nome,
  whatsapp,
  onSuccess,
}: SendInviteModalProps) {
  const [availableInvites, setAvailableInvites] = useState<Invite[]>([]);
  const [selectedInvite, setSelectedInvite] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingInvites, setLoadingInvites] = useState(false);

  // Carregar convites disponíveis ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      loadInvites();
    }
  }, [isOpen]);

  const loadInvites = async () => {
    setLoadingInvites(true);
    try {
      const result = await getAvailableInvites();
      if (result.success) {
        setAvailableInvites(result.data || []);
        if (result.data && result.data.length > 0) {
          setSelectedInvite(result.data[0].code);
        }
      } else {
        alert(`Erro ao carregar convites: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
      alert('Erro ao carregar convites disponíveis');
    } finally {
      setLoadingInvites(false);
    }
  };

  const handleSendInvite = async () => {
    if (!selectedInvite) {
      alert('Selecione um convite');
      return;
    }

    setLoading(true);
    try {
      const result = await sendInviteToClient(nome, whatsapp, selectedInvite);
      if (result.success) {
        alert('✅ ' + result.message);
        onClose();
        onSuccess?.();
      } else {
        alert('❌ Erro: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ Erro ao enviar convite: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-6">Enviar Convite</h2>

        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium mb-2">Nome</label>
            <Input
              type="text"
              value={nome}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Pré-preenchido da solicitação
            </p>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium mb-2">WhatsApp</label>
            <Input
              type="text"
              value={whatsapp}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Pré-preenchido da solicitação
            </p>
          </div>

          {/* Convite */}
          <div>
            <label className="block text-sm font-medium mb-2">Convite</label>
            {loadingInvites ? (
              <div className="p-3 bg-gray-100 rounded text-center text-sm text-gray-600">
                Carregando convites disponíveis...
              </div>
            ) : availableInvites.length === 0 ? (
              <div className="p-3 bg-red-50 rounded text-center text-sm text-red-600">
                Nenhum convite disponível
              </div>
            ) : (
              <select
                value={selectedInvite}
                onChange={(e) => setSelectedInvite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Selecione um convite...</option>
                {availableInvites.map((invite) => (
                  <option key={invite.id} value={invite.code}>
                    {invite.code} {invite.category && `(${invite.category})`}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 mt-8">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSendInvite}
            disabled={loading || !selectedInvite || availableInvites.length === 0}
            className="flex-1 bg-black text-white hover:bg-gray-800"
          >
            {loading ? 'Enviando...' : 'Enviar Convite'}
          </Button>
        </div>
      </div>
    </>
  );
}
