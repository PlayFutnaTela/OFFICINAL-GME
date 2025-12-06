'use client';

import { useEffect, useState } from 'react';
import { createInvites } from '@/actions/invites';
import { approveMember, rejectMember } from '@/actions/members';
import { testInviteSystem } from '@/actions/test-invites';
import { testCompleteFlow } from '@/actions/test-complete-flow';
import { getWebhookUrl, updateWebhookUrl } from '@/actions/webhook-config';
import { 
  getInviteRequestWebhookUrl, 
  updateInviteRequestWebhookUrl 
} from '@/actions/invite-request';
import {
  getInviteRequests,
  getAllInviteRequests,
  approveInviteRequest,
  rejectInviteRequest,
} from '@/actions/invite-requests';
import {
  getSendInviteWebhookUrl,
  updateSendInviteWebhookUrl,
} from '@/actions/send-invite';
import { SendInviteModal } from '@/components/send-invite-modal';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  PieChart, Pie, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer 
} from 'recharts';

type Tab = 'metrics' | 'generate' | 'list' | 'pending' | 'webhook' | 'solicitacoes';

interface PendingMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  extra_info: any;
}

interface InviteRequest {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  motivo: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  rejection_reason?: string;
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
  const [inviteRequests, setInviteRequests] = useState<InviteRequest[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [invitesWithUsers, setInvitesWithUsers] = useState<Array<Invite & { userName?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInviteRequests, setLoadingInviteRequests] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [quantity, setQuantity] = useState(5);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [inviteRequestWebhookUrl, setInviteRequestWebhookUrl] = useState('');
  const [inviteRequestWebhookSaved, setInviteRequestWebhookSaved] = useState(false);
  const [sendInviteWebhookUrl, setSendInviteWebhookUrl] = useState('');
  const [sendInviteWebhookSaved, setSendInviteWebhookSaved] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Modal state
  const [showSendInviteModal, setShowSendInviteModal] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState<{ nome: string; whatsapp: string } | null>(null);
  
  // Filtros para convites
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Estados para a tabela de solicitações na aba de consulta
  const [allInviteRequests, setAllInviteRequests] = useState<InviteRequest[]>([]);
  const [filterRequestStatus, setFilterRequestStatus] = useState<string>('all');
  const [currentRequestPage, setCurrentRequestPage] = useState(1);
  const requestsPerPage = 10;

  // Estados para dados dos gráficos
  const [chartData, setChartData] = useState({
    statusRequests: [] as any[],
    invitesComparison: [] as any[],
    dailyTrend: [] as any[],
    inviteStatus: [] as any[],
  });

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
          .from('invite_requests')
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

        // Buscar nomes/emails dos usuários que usaram os convites
        if (invitesList && invitesList.length > 0) {
          const usedInvites = invitesList.filter((inv) => inv.status === 'used' && inv.used_by);
          
          if (usedInvites.length > 0) {
            // Build a cleaned, unique list of user ids that used invites.
            // When there is a single id PostgREST can be picky about `in.(id)`
            // (and some clients or encoders may end up generating malformed queries),
            // so use `.eq` for single values and `.in` only for arrays of length > 1.
            const usedIds = Array.from(
              new Set(usedInvites.map((inv) => inv.used_by).filter(Boolean))
            );

            let profilesQuery = supabase.from('profiles').select('id, full_name, email');

            if (usedIds.length === 1) {
              profilesQuery = profilesQuery.eq('id', usedIds[0]);
            } else {
              profilesQuery = profilesQuery.in('id', usedIds);
            }

            const { data: profiles } = await profilesQuery;

            const profileMap = new Map(
              (profiles || []).map((p) => [
                p.id,
                {
                  name: p.full_name || p.email || 'Usuário sem nome',
                },
              ])
            );

            const invitesWithUserInfo = invitesList.map((invite) => ({
              ...invite,
              userName: invite.used_by ? profileMap.get(invite.used_by)?.name : undefined,
            }));

            setInvitesWithUsers(invitesWithUserInfo);
          } else {
            setInvitesWithUsers(invitesList);
          }
        }

        // Carregar webhook do banco de dados
        const webhookResult = await getWebhookUrl();
        if (webhookResult.success && webhookResult.webhookUrl) {
          setWebhookUrl(webhookResult.webhookUrl);
        }

        // Carregar webhook de solicitação de convite
        const inviteRequestResult = await getInviteRequestWebhookUrl();
        if (inviteRequestResult.success && inviteRequestResult.webhookUrl) {
          setInviteRequestWebhookUrl(inviteRequestResult.webhookUrl);
        }

        // Carregar webhook de envio de convite
        const sendInviteResult = await getSendInviteWebhookUrl();
        console.log('[loadData] getSendInviteWebhookUrl resultado:', sendInviteResult);
        if (sendInviteResult.success && sendInviteResult.webhookUrl) {
          console.log('[loadData] Webhook URL carregado:', sendInviteResult.webhookUrl);
          setSendInviteWebhookUrl(sendInviteResult.webhookUrl);
        } else {
          console.error('[loadData] Erro ao carregar webhook:', sendInviteResult.error);
        }

        // Preparar dados para os gráficos
        // 1. Status das Solicitações (Gráfico de Pizza)
        const { count: pendingReqCount } = await supabase
          .from('invite_requests')
          .select('*', { count: 'exact' })
          .eq('status', 'pending');

        const { count: approvedReqCount } = await supabase
          .from('invite_requests')
          .select('*', { count: 'exact' })
          .eq('status', 'approved');

        const { count: rejectedReqCount } = await supabase
          .from('invite_requests')
          .select('*', { count: 'exact' })
          .eq('status', 'rejected');

        const statusData = [
          { name: 'Pendente', value: pendingReqCount || 0, color: '#fbbf24' },
          { name: 'Aprovado', value: approvedReqCount || 0, color: '#34d399' },
          { name: 'Rejeitado', value: rejectedReqCount || 0, color: '#f87171' },
        ];

        // 2. Comparação Convites: Gerados vs Usados (Gráfico de Barras)
        const invitesComparisonData = [
          {
            name: 'Convites',
            'Total Gerado': totalCount || 0,
            'Total Usado': usedCount || 0,
            'Disponível': (totalCount || 0) - (usedCount || 0),
          },
        ];

        // 3. Status dos Convites (Gráfico de Rosca)
        const availableCount = (totalCount || 0) - (usedCount || 0);
        const inviteStatusData = [
          { name: 'Usado', value: usedCount || 0, color: '#3b82f6' },
          { name: 'Disponível', value: availableCount, color: '#10b981' },
        ];

        // 4. Tendência Diária (Gráfico de Linha) - últimos 7 dias
        const dailyData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' });
          
          // Simular dados (em produção, você buscaria do banco)
          dailyData.push({
            date: dateStr,
            'Solicitações': Math.floor(Math.random() * 10),
          });
        }

        setChartData({
          statusRequests: statusData,
          invitesComparison: invitesComparisonData,
          dailyTrend: dailyData,
          inviteStatus: inviteStatusData,
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Carregar solicitações de convite quando a aba muda
  useEffect(() => {
    if (tab === 'pending') {
      const loadInviteRequests = async () => {
        console.log('[loadInviteRequests] Iniciando...');
        setLoadingInviteRequests(true);
        try {
          const result = await getInviteRequests('pending');
          console.log('[loadInviteRequests] Resultado:', result);
          if (result.success) {
            console.log('[loadInviteRequests] ✅ Dados carregados:', result.data);
            setInviteRequests(result.data || []);
          } else {
            console.error('[loadInviteRequests] Erro:', result.error);
            setInviteRequests([]);
          }
        } catch (error) {
          console.error('[loadInviteRequests] Erro catch:', error);
          setInviteRequests([]);
        } finally {
          setLoadingInviteRequests(false);
        }
      };

      loadInviteRequests();
    }
  }, [tab]);

  // Carregar TODAS as solicitações quando a aba solicitacoes é selecionada
  useEffect(() => {
    if (tab === 'solicitacoes') {
      const loadAllRequests = async () => {
        try {
          const result = await getAllInviteRequests();
          if (result.success) {
            setAllInviteRequests(result.data || []);
          } else {
            console.error('Erro ao carregar solicitações:', result.error);
            setAllInviteRequests([]);
          }
        } catch (error) {
          console.error('Erro ao carregar solicitações:', error);
          setAllInviteRequests([]);
        }
      };

      loadAllRequests();
    }
  }, [tab]);

  // Função para filtrar convites
  const getFilteredInvites = () => {
    return invitesWithUsers.filter((invite) => {
      const statusMatch = filterStatus === 'all' || invite.status === filterStatus;
      const categoryMatch = filterCategory === 'all' || invite.category === filterCategory;
      return statusMatch && categoryMatch;
    });
  };

  const filteredInvites = getFilteredInvites();

  // Função para filtrar solicitações
  const getFilteredRequests = () => {
    if (filterRequestStatus === 'all') {
      return allInviteRequests;
    }
    return allInviteRequests.filter(req => req.status === filterRequestStatus);
  };

  const filteredRequests = getFilteredRequests();

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

  const handleSaveWebhook = async () => {
    if (!webhookUrl) {
      alert('Por favor, insira uma URL válida');
      return;
    }

    try {
      const result = await updateWebhookUrl(webhookUrl);
      if (result.success) {
        setWebhookSaved(true);
        alert('✅ URL do webhook salva com sucesso no banco de dados!');
        setTimeout(() => setWebhookSaved(false), 3000);
      } else {
        alert(`❌ Erro ao salvar: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Erro: ${error}`);
    }
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

  const handleTestSystem = async () => {
    try {
      const result = await testInviteSystem();
      console.log('Resultado do teste:', result);
      if (result.success) {
        alert('✅ Sistema funcionando corretamente!\nVerifique o console para detalhes.');
      } else {
        alert(`❌ Erro no sistema:\n${result.error}\n\nDetalhes no console.`);
      }
    } catch (error: any) {
      console.error('Erro no teste:', error);
      alert(`❌ Erro ao testar sistema:\n${error.message}`);
    }
  };

  const handleSaveInviteRequestWebhook = async () => {
    if (!inviteRequestWebhookUrl) {
      alert('Por favor, insira uma URL válida');
      return;
    }

    try {
      const result = await updateInviteRequestWebhookUrl(inviteRequestWebhookUrl);
      if (result.success) {
        setInviteRequestWebhookSaved(true);
        alert('✅ URL do webhook de solicitação de convite salva com sucesso no banco de dados!');
        setTimeout(() => setInviteRequestWebhookSaved(false), 3000);
      } else {
        alert(`❌ Erro ao salvar: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Erro: ${error}`);
    }
  };

  const handleTestInviteRequestWebhook = async () => {
    const url = inviteRequestWebhookUrl;
    if (!url) {
      alert('Nenhuma URL configurada para solicitação de convite');
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test_invite_request',
          timestamp: new Date().toISOString(),
          data: {
            nome: 'Teste Solicitação',
            email: 'teste@gerezim.com',
            whatsapp: '11999999999',
            motivo: 'Teste de webhook de solicitação de convite',
          },
        }),
      });

      if (response.ok) {
        alert('✅ Webhook de solicitação enviado com sucesso!');
      } else {
        alert(`❌ Erro: ${response.statusText}`);
      }
    } catch (error) {
      alert(`❌ Erro ao enviar: ${error}`);
    }
  };

  const handleTestFlow = async () => {
    // Pegar o primeiro convite disponível
    const { data: availableInvites } = await supabase
      .from('invites')
      .select('code')
      .eq('status', 'unused')
      .limit(1);

    if (!availableInvites || availableInvites.length === 0) {
      alert('❌ Nenhum convite disponível. Gere um convite primeiro!');
      return;
    }

    const testCode = availableInvites[0].code;
    alert(`🔧 Testando fluxo com código: ${testCode}\n\nVerifique o console...`);

    try {
      const result = await testCompleteFlow(testCode);
      console.log('Resultado do fluxo completo:', result);
      
      if (result.success) {
        alert(`✅ Fluxo completo funcionando!\n\nCódigo: ${testCode}\nMembro criado: ${result.member.email}\n\nDetalhes no console.`);
      } else {
        alert(`❌ Erro no passo: ${result.step}\n${result.error}\n\nDetalhes no console.`);
      }
    } catch (error: any) {
      console.error('Erro no teste de fluxo:', error);
      alert(`❌ Erro:\n${error.message}`);
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

  const handleApproveInviteRequest = async (requestId: string) => {
    if (!confirm('Aprovar esta solicitação de convite?')) return;

    try {
      const result = await approveInviteRequest(requestId);
      if (result.success) {
        alert('✅ Solicitação de convite aprovada!');
        // Remover da lista e recarregar
        setInviteRequests((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        alert(`❌ Erro: ${result.error}`);
      }
    } catch (error: any) {
      alert(`❌ Erro: ${error.message}`);
    }
  };

  const handleRejectInviteRequest = async (requestId: string) => {
    const reason = prompt('Motivo da rejeição:');
    if (!reason) return;

    try {
      const result = await rejectInviteRequest(requestId, reason);
      if (result.success) {
        alert('✅ Solicitação de convite rejeitada!');
        // Remover da lista
        setInviteRequests((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        alert(`❌ Erro: ${result.error}`);
      }
    } catch (error: any) {
      alert(`❌ Erro: ${error.message}`);
    }
  };

  const handleOpenSendInviteModal = (request: InviteRequest) => {
    setSelectedRequestData({
      nome: request.nome,
      whatsapp: request.whatsapp,
    });
    setShowSendInviteModal(true);
  };

  const handleCloseSendInviteModal = () => {
    setShowSendInviteModal(false);
    setSelectedRequestData(null);
  };

  const handleSaveSendInviteWebhook = async () => {
    if (!sendInviteWebhookUrl) {
      alert('Por favor, insira uma URL válida');
      return;
    }

    try {
      const result = await updateSendInviteWebhookUrl(sendInviteWebhookUrl);
      if (result.success) {
        setSendInviteWebhookSaved(true);
        alert('✅ URL do webhook de envio de convite salva com sucesso no banco de dados!');
        setTimeout(() => setSendInviteWebhookSaved(false), 3000);
      } else {
        alert(`❌ Erro ao salvar: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Erro: ${error}`);
    }
  };

  const handleTestSendInviteWebhook = async () => {
    const url = sendInviteWebhookUrl;
    if (!url) {
      alert('Nenhuma URL configurada para envio de convite');
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'send_invite_to_client',
          timestamp: new Date().toISOString(),
          data: {
            nome: 'Teste Envio',
            whatsapp: '11999999999',
            convite: 'GZM-TEST',
            data: new Date().toISOString(),
          },
        }),
      });

      if (response.ok) {
        alert('✅ Webhook de envio de convite testado com sucesso!');
      } else {
        alert(`❌ Erro: ${response.statusText}`);
      }
    } catch (error) {
      alert(`❌ Erro ao enviar: ${error}`);
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
          {(['metrics', 'generate', 'list', 'pending', 'webhook', 'solicitacoes'] as Tab[]).map((t) => (
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
              {t === 'solicitacoes' && 'Solicitações'}
            </button>
          ))}
        </div>

        {/* Métricas */}
        {tab === 'metrics' && (
          <div className="space-y-8">
            {/* Linha 1: Cards */}
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

            {/* Linha 2: Gráficos de Pizza e Barras */}
            <div className="grid grid-cols-2 gap-6">
              {/* Gráfico de Pizza - Status das Solicitações */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Status das Solicitações</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.statusRequests}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.statusRequests.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Barras - Convites Gerados vs Usados */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Convites: Gerados vs Usados</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.invitesComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Total Gerado" fill="#3b82f6" />
                    <Bar dataKey="Total Usado" fill="#10b981" />
                    <Bar dataKey="Disponível" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Linha 3: Gráficos de Linha e Rosca */}
            <div className="grid grid-cols-2 gap-6">
              {/* Gráfico de Linha - Tendência de Solicitações */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Tendência de Solicitações (7 dias)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Solicitações" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Rosca - Status dos Convites */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Status dos Convites</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.inviteStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {chartData.inviteStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
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
            {invitesWithUsers.length === 0 ? (
              <p className="text-gray-500">Nenhum convite gerado ainda</p>
            ) : (
              <>
                {/* Filtros */}
                <div className="bg-white p-4 rounded-lg border space-y-4">
                  <h3 className="text-lg font-bold mb-4">Filtros</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Filtro de Status */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => {
                          setFilterStatus(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="all">Todos</option>
                        <option value="unused">Disponível</option>
                        <option value="used">Usado</option>
                        <option value="disabled">Desabilitado</option>
                      </select>
                    </div>

                    {/* Filtro de Categoria */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Categoria</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => {
                          setFilterCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="all">Todas</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Info de filtros aplicados */}
                  <div className="text-sm text-gray-600 pt-2 border-t">
                    <span className="font-medium">Resultado:</span> {filteredInvites.length} convite{filteredInvites.length !== 1 ? 's' : ''} encontrado{filteredInvites.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="text-left p-4 font-medium">Código</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Categoria</th>
                        <th className="text-left p-4 font-medium">Usuário</th>
                        <th className="text-center p-4 font-medium">Uso</th>
                        <th className="text-left p-4 font-medium">Criado em</th>
                        <th className="text-left p-4 font-medium">Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvites.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-gray-500">
                            Nenhum convite encontrado com os filtros selecionados
                          </td>
                        </tr>
                      ) : (
                        filteredInvites
                          .slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage
                          )
                          .map((invite) => (
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
                            <td className="p-4 text-sm text-gray-700">
                              {invite.userName ? (
                                <span className="font-medium">{invite.userName}</span>
                              ) : (
                                <span className="text-gray-400 italic">-</span>
                              )}
                            </td>
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
                          ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                <div className="flex items-center justify-between mt-6 px-4">
                  <p className="text-sm text-gray-600">
                    Mostrando {filteredInvites.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a{' '}
                    {Math.min(currentPage * itemsPerPage, filteredInvites.length)} de{' '}
                    {filteredInvites.length} convites
                  </p>

                  <div className="flex gap-2">>
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                    >
                      ← Anterior
                    </Button>

                    <div className="flex items-center gap-2">
                      {Array.from({
                        length: Math.ceil(filteredInvites.length / itemsPerPage),
                      }).map((_, idx) => (
                        <button
                          key={idx + 1}
                          onClick={() => setCurrentPage(idx + 1)}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            currentPage === idx + 1
                              ? 'bg-black text-white'
                              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <Button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(
                            Math.ceil(filteredInvites.length / itemsPerPage),
                            prev + 1
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(filteredInvites.length / itemsPerPage)
                      }
                      variant="outline"
                    >
                      Próxima →
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Pendentes */}
        {tab === 'pending' && (
          <div className="space-y-6">
            {/* Seção de Solicitações de Convite */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Solicitações de Convite</h2>
              {loadingInviteRequests ? (
                <p className="text-gray-500">Carregando solicitações...</p>
              ) : inviteRequests.length === 0 ? (
                <p className="text-gray-500">Nenhuma solicitação de convite pendente</p>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="text-left p-4 font-medium">Nome</th>
                        <th className="text-left p-4 font-medium">Email</th>
                        <th className="text-left p-4 font-medium">WhatsApp</th>
                        <th className="text-left p-4 font-medium">Motivo</th>
                        <th className="text-left p-4 font-medium">Data</th>
                        <th className="text-center p-4 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inviteRequests.map((request) => (
                        <tr key={request.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium">{request.nome}</td>
                          <td className="p-4 text-sm text-gray-700">{request.email}</td>
                          <td className="p-4 text-sm text-gray-700">{request.whatsapp}</td>
                          <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={request.motivo}>
                            {request.motivo}
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {new Date(request.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex gap-2 justify-center">
                              <Button
                                onClick={() => handleOpenSendInviteModal(request)}
                                className="bg-green-600 text-white hover:bg-green-700 text-xs px-3 py-1"
                              >
                                Aprovar
                              </Button>
                              <Button
                                onClick={() => handleRejectInviteRequest(request.id)}
                                className="bg-red-600 text-white hover:bg-red-700 text-xs px-3 py-1"
                              >
                                Rejeitar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <hr className="my-6" />

            {/* Seção de Candidatos (pendentes de aprovação) */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Candidatos Pendentes</h2>
              {pendingMembers.length === 0 ? (
                <p className="text-gray-500">Nenhum candidato pendente</p>
              ) : (
                <div className="space-y-4">
                  {pendingMembers.map((member) => (
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
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Webhook */}
        {tab === 'webhook' && (
          <div className="bg-white p-6 rounded-lg border max-w-4xl">
            <div className="space-y-6">
              {/* Seção 1: Webhook de Novo Cadastro */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-900">Notificação de Novo Cadastro</h3>
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
                      {webhookUrl || 'Carregando...'}
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
  "type": "user_registered_with_invite",
  "data": {
    "code": "GZM-A9KQ12",
    "invite_id": "...",
    "user_id": "...",
    "email": "joao@example.com",
    "whatsapp": "11999999999",
    "timestamp": "2025-12-05T20:00:00Z"
  }
}`}</pre>
                  </div>
                </div>
              </div>

              <hr className="my-6" />

              {/* Seção 2: Webhook de Solicitação de Convite */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-900">Solicitação de Convite</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">URL do Webhook</label>
                    <Input
                      type="url"
                      placeholder="https://n8n-n8n-start.yl9ubt.easypanel.host/webhook-test/solicitacao-convite"
                      value={inviteRequestWebhookUrl}
                      onChange={(e) => setInviteRequestWebhookUrl(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      URL para receber notificações de solicitações de convite
                    </p>
                  </div>

                  {/* Webhook padrão */}
                  <div className="bg-green-50 border border-green-200 p-4 rounded">
                    <p className="text-xs font-medium text-green-900 mb-2">URL em Uso Agora:</p>
                    <p className="text-xs text-green-800 break-all">
                      {inviteRequestWebhookUrl || 'Carregando...'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleSaveInviteRequestWebhook}
                      disabled={!inviteRequestWebhookUrl}
                      className="w-full bg-black text-white"
                    >
                      {inviteRequestWebhookSaved ? '✅ Salvo!' : 'Salvar URL'}
                    </Button>
                    <Button
                      onClick={handleTestInviteRequestWebhook}
                      disabled={!inviteRequestWebhookUrl}
                      className="w-full bg-gray-600 text-white hover:bg-gray-700"
                    >
                      Testar Webhook
                    </Button>
                  </div>

                  <div className="bg-gray-50 p-4 rounded text-xs">
                    <p className="font-medium mb-2">O webhook receberá JSON assim:</p>
                    <pre className="overflow-auto text-gray-700">{`{
  "type": "invite_request",
  "data": {
    "nome": "João Silva",
    "email": "joao@example.com",
    "whatsapp": "11999999999",
    "motivo": "Desejo participar da Gerezim para expandir minha rede de negócios",
    "timestamp": "2025-12-05T20:00:00Z"
  }
}`}</pre>
                  </div>
                </div>
              </div>

              <hr className="my-6" />

              {/* Seção 3: Webhook de Envio de Convite */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-900">Envio de Convite ao Cliente</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">URL do Webhook</label>
                    <Input
                      type="url"
                      placeholder="https://n8n-n8n-start.yl9ubt.easypanel.host/webhook-test/enviar-convite"
                      value={sendInviteWebhookUrl}
                      onChange={(e) => setSendInviteWebhookUrl(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      URL para enviar convites aos clientes que solicitaram
                    </p>
                  </div>

                  {/* Webhook padrão */}
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded">
                    <p className="text-xs font-medium text-purple-900 mb-2">URL em Uso Agora:</p>
                    <p className="text-xs text-purple-800 break-all">
                      {sendInviteWebhookUrl || 'Carregando...'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleSaveSendInviteWebhook}
                      disabled={!sendInviteWebhookUrl}
                      className="w-full bg-black text-white"
                    >
                      {sendInviteWebhookSaved ? '✅ Salvo!' : 'Salvar URL'}
                    </Button>
                    <Button
                      onClick={handleTestSendInviteWebhook}
                      disabled={!sendInviteWebhookUrl}
                      className="w-full bg-gray-600 text-white hover:bg-gray-700"
                    >
                      Testar Webhook
                    </Button>
                  </div>

                  <div className="bg-gray-50 p-4 rounded text-xs">
                    <p className="font-medium mb-2">O webhook receberá JSON assim:</p>
                    <pre className="overflow-auto text-gray-700">{`{
  "type": "send_invite_to_client",
  "data": {
    "nome": "João Silva",
    "whatsapp": "11999999999",
    "convite": "GZM-XXXX",
    "data": "2025-12-06T01:30:00Z"
  }
}`}</pre>
                  </div>
                </div>
              </div>

              <hr className="my-6" />

              {/* Botões de Teste do Sistema */}
              <div className="space-y-2">
                <Button
                  onClick={handleTestSystem}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  🔧 Testar Sistema Completo
                </Button>
                <Button
                  onClick={handleTestFlow}
                  className="w-full bg-purple-600 text-white hover:bg-purple-700"
                >
                  🧪 Testar Fluxo Completo (com código real)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Solicitações */}
        {tab === 'solicitacoes' && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Consulta de Solicitações de Convite</h3>
            
            {/* Filtro de Status */}
            <div className="mb-4 max-w-xs">
              <label className="block text-sm font-medium mb-2">Filtrar por Status</label>
              <select
                value={filterRequestStatus}
                onChange={(e) => {
                  setFilterRequestStatus(e.target.value);
                  setCurrentRequestPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
              >
                <option value="all">Todos ({allInviteRequests.length})</option>
                <option value="pending">Pendente ({allInviteRequests.filter(r => r.status === 'pending').length})</option>
                <option value="approved">Aprovado ({allInviteRequests.filter(r => r.status === 'approved').length})</option>
                <option value="rejected">Rejeitado ({allInviteRequests.filter(r => r.status === 'rejected').length})</option>
              </select>
            </div>

            {/* Tabela de Solicitações */}
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma solicitação encontrada
              </div>
            ) : (
              <>
                <div className="overflow-x-auto border rounded-lg mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="text-left p-3 font-medium">Nome</th>
                        <th className="text-left p-3 font-medium">Email</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests
                        .slice(
                          (currentRequestPage - 1) * requestsPerPage,
                          currentRequestPage * requestsPerPage
                        )
                        .map((request) => (
                          <tr key={request.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-900">{request.nome}</td>
                            <td className="p-3 text-gray-700 text-xs">{request.email}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                                  request.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : request.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {request.status === 'pending' && '⏳ Pendente'}
                                {request.status === 'approved' && '✅ Aprovado'}
                                {request.status === 'rejected' && '❌ Rejeitado'}
                              </span>
                            </td>
                            <td className="p-3 text-gray-600 text-xs">
                              {new Date(request.created_at).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                {Math.ceil(filteredRequests.length / requestsPerPage) > 1 && (
                  <div className="flex items-center justify-between mt-4 px-2">
                    <p className="text-xs text-gray-600">
                      Mostrando {(currentRequestPage - 1) * requestsPerPage + 1} a{' '}
                      {Math.min(currentRequestPage * requestsPerPage, filteredRequests.length)} de{' '}
                      {filteredRequests.length}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentRequestPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentRequestPage === 1}
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← Ant.
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({
                          length: Math.ceil(filteredRequests.length / requestsPerPage),
                        }).map((_, idx) => (
                          <button
                            key={idx + 1}
                            onClick={() => setCurrentRequestPage(idx + 1)}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              currentRequestPage === idx + 1
                                ? 'bg-black text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentRequestPage((prev) =>
                            Math.min(
                              Math.ceil(filteredRequests.length / requestsPerPage),
                              prev + 1
                            )
                          )
                        }
                        disabled={
                          currentRequestPage === Math.ceil(filteredRequests.length / requestsPerPage)
                        }
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Prox. →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal de Envio de Convite */}
      {selectedRequestData && (
        <SendInviteModal
          isOpen={showSendInviteModal}
          onClose={handleCloseSendInviteModal}
          nome={selectedRequestData.nome}
          whatsapp={selectedRequestData.whatsapp}
          onSuccess={() => {
            // Recarregar solicitações após envio bem-sucedido
            const loadInviteRequests = async () => {
              try {
                const result = await getInviteRequests('pending');
                if (result.success) {
                  setInviteRequests(result.data || []);
                }
              } catch (error) {
                console.error('Erro ao recarregar solicitações:', error);
              }
            };
            loadInviteRequests();
          }}
        />
      )}
    </div>
  );
}
