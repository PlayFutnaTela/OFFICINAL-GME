'use client';

import { useEffect, useState } from 'react';
import { createInvites } from '@/actions/invites';
import { approveMember, rejectMember } from '@/actions/members';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Tab = 'metrics' | 'generate' | 'list' | 'pending' | 'webhook';

interface PendingMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  extra_info: any;
}

interface Invite {
  id: string;
  code: string;
  status: string;
  created_at: string;
  times_used: number;
  max_uses: number;
  category: string;
  notes: string;
}

interface Metrics {
  totalInvites: number;
  usedInvites: number;
  pendingMembers: number;
  approvedMembers: number;
}

export default function ConvitesAdminPage() {
  const [tab, setTab] = useState<Tab>('metrics');
  const [metrics, setMetrics] = useState<Metrics>({
    totalInvites: 0,
    usedInvites: 0,
    pendingMembers: 0,
    approvedMembers: 0,
  });
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [quantity, setQuantity] = useState(5);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSaved, setWebhookSaved] = useState(false);

  const supabase = createClient();

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      try {
        // Métricas
        const { count: totalCount } = await supabase
          .from('invites')
          .select('*', { count: 'exact' });

        const { count: usedCount } = await supabase
          .from('invites')
          .select('*', { count: 'exact' })
          .eq('status', 'used');

        const { count: pendingCount } = await supabase
          .from('pending_members')
          .select('*', { count: 'exact' })
          .eq('status', 'pending');

        const { count: approvedCount } = await supabase
          .from('pending_members')
          .select('*', { count: 'exact' })
          .eq('status', 'approved');

        setMetrics({
          totalInvites: totalCount || 0,
          usedInvites: usedCount || 0,
          pendingMembers: pendingCount || 0,
          approvedMembers: approvedCount || 0,
        });

        // Pendentes
        const { data: pending } = await supabase
          .from('pending_members')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        setPendingMembers(pending || []);

        // Convites gerados
        const { data: invitesList } = await supabase
          .from('invites')
          .select('*')
          .order('created_at', { ascending: false });

        setInvites(invitesList || []);

        // Webhook do localStorage
        const saved = localStorage.getItem('webhookUrl');
        if (saved) setWebhookUrl(saved);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleGenerateInvites = async () => {
    setGenerating(true);
    try {
      const result = await createInvites({
        quantity,
        category: 'standard',
      });

      alert(`✅ ${result.codes.length} convites gerados:\n${result.codes.join('\n')}`);
      setQuantity(5);

      // Atualizar métricas e lista de convites
      setMetrics((prev) => ({
        ...prev,
        totalInvites: prev.totalInvites + result.codes.length,
      }));

      // Recarregar lista de convites
      const { data: invitesList } = await supabase
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false });

      setInvites(invitesList || []);

      // Mudar para aba de lista
      setTab('list');
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveWebhook = () => {
    localStorage.setItem('webhookUrl', webhookUrl);
    process.env.WEBHOOK_URL = webhookUrl;
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 3000);
  };

  const handleTestWebhook = async () => {
    const url = webhookUrl || localStorage.getItem('webhookUrl');
    if (!url) {
      alert('Nenhuma URL configurada');
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test_webhook',
          timestamp: new Date().toISOString(),
          data: {
            name: 'Teste Webhook',
            email: 'teste@gerezim.com',
            phone: '+55 11 99999-9999',
            interests: ['teste'],
            code: 'GZM-TEST',
          },
        }),
      });

      if (response.ok) {
        alert('✅ Webhook enviado com sucesso!');
      } else {
        alert(`❌ Erro: ${response.statusText}`);
      }
    } catch (error) {
      alert(`❌ Erro ao enviar: ${error}`);
    }
  };

  const handleApproveMember = async (id: string) => {
    if (!confirm('Aprovar este candidato?')) return;

    try {
      await approveMember(id);
      alert('✅ Candidato aprovado! Email enviado.');
      setPendingMembers((prev) => prev.filter((m) => m.id !== id));
      setMetrics((prev) => ({
        ...prev,
        pendingMembers: prev.pendingMembers - 1,
        approvedMembers: prev.approvedMembers + 1,
      }));
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    }
  };

  const handleRejectMember = async (id: string) => {
    const reason = prompt('Motivo da rejeição:');
    if (!reason) return;

    try {
      await rejectMember(id, reason);
      alert('✅ Candidato rejeitado! Email enviado.');
      setPendingMembers((prev) => prev.filter((m) => m.id !== id));
      setMetrics((prev) => ({
        ...prev,
        pendingMembers: prev.pendingMembers - 1,
      }));
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Gerenciar Convites</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          {(['metrics', 'generate', 'list', 'pending', 'webhook'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 px-4 font-medium ${
                tab === t ? 'border-b-2 border-black' : 'text-gray-600'
              }`}
            >
              {t === 'metrics' && 'Métricas'}
              {t === 'generate' && 'Gerar Convites'}
              {t === 'list' && 'Convites Gerados'}
              {t === 'pending' && 'Pendentes'}
              {t === 'webhook' && 'Webhook'}
            </button>
          ))}
        </div>

        {/* Métricas */}
        {tab === 'metrics' && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border">
              <p className="text-gray-600 text-sm">Total de Convites</p>
              <p className="text-3xl font-bold">{metrics.totalInvites}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <p className="text-gray-600 text-sm">Convites Usados</p>
              <p className="text-3xl font-bold">{metrics.usedInvites}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <p className="text-gray-600 text-sm">Pendentes</p>
              <p className="text-3xl font-bold">{metrics.pendingMembers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <p className="text-gray-600 text-sm">Aprovados</p>
              <p className="text-3xl font-bold">{metrics.approvedMembers}</p>
            </div>
          </div>
        )}

        {/* Gerar */}
        {tab === 'generate' && (
          <div className="bg-white p-6 rounded-lg border max-w-md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quantidade</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  disabled={generating}
                />
              </div>
              <Button
                onClick={handleGenerateInvites}
                disabled={generating}
                className="w-full bg-black text-white"
              >
                {generating ? 'Gerando...' : 'Gerar Convites'}
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Convites */}
        {tab === 'list' && (
          <div className="space-y-4">
            {invites.length === 0 ? (
              <p className="text-gray-500">Nenhum convite gerado ainda</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="text-left p-4 font-medium">Código</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Categoria</th>
                      <th className="text-center p-4 font-medium">Uso</th>
                      <th className="text-left p-4 font-medium">Criado em</th>
                      <th className="text-left p-4 font-medium">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((invite) => (
                      <tr key={invite.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-mono font-bold text-blue-600">{invite.code}</td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              invite.status === 'unused'
                                ? 'bg-green-100 text-green-800'
                                : invite.status === 'used'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {invite.status === 'unused' && '✓ Disponível'}
                            {invite.status === 'used' && '✓ Usado'}
                            {invite.status === 'disabled' && '✗ Desabilitado'}
                          </span>
                        </td>
                        <td className="p-4 text-sm">{invite.category || '-'}</td>
                        <td className="p-4 text-center text-sm">
                          {invite.times_used}/{invite.max_uses || '∞'}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                          {invite.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pendentes */}
        {tab === 'pending' && (
          <div className="space-y-4">
            {pendingMembers.length === 0 ? (
              <p className="text-gray-500">Nenhum candidato pendente</p>
            ) : (
              pendingMembers.map((member) => (
                <div key={member.id} className="bg-white p-6 rounded-lg border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      {member.phone && <p className="text-sm text-gray-600">{member.phone}</p>}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(member.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  {member.extra_info?.interests?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-2">Interesses:</p>
                      <div className="flex gap-2 flex-wrap">
                        {member.extra_info.interests.map((interest: string) => (
                          <span key={interest} className="bg-gray-100 px-3 py-1 rounded text-xs">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApproveMember(member.id)}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      Aprovar
                    </Button>
                    <Button
                      onClick={() => handleRejectMember(member.id)}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Webhook */}
        {tab === 'webhook' && (
          <div className="bg-white p-6 rounded-lg border max-w-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">URL do Webhook</label>
                <Input
                  type="url"
                  placeholder="https://n8n-n8n-start.yl9ubt.easypanel.host/webhook-test/convitegerezim"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  URL para receber notificações quando um candidato preenche o formulário
                </p>
              </div>

              {/* Webhook padrão */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <p className="text-xs font-medium text-blue-900 mb-2">URL Padrão (em uso agora):</p>
                <p className="text-xs text-blue-800 break-all">
                  {process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://n8n-n8n-start.yl9ubt.easypanel.host/webhook-test/convitegerezim'}
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleSaveWebhook}
                  disabled={!webhookUrl}
                  className="w-full bg-black text-white"
                >
                  {webhookSaved ? '✅ Salvo!' : 'Salvar URL'}
                </Button>
                <Button
                  onClick={handleTestWebhook}
                  disabled={!webhookUrl}
                  className="w-full bg-gray-600 text-white hover:bg-gray-700"
                >
                  Testar Webhook
                </Button>
              </div>

              <div className="bg-gray-50 p-4 rounded text-xs">
                <p className="font-medium mb-2">O webhook receberá JSON assim:</p>
                <pre className="overflow-auto text-gray-700">{`{
  "type": "new_pending_member",
  "data": {
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "+55 11 99999-9999",
    "interests": ["carros", "imóveis"],
    "code": "GZM-A9KQ12"
  }
}`}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
