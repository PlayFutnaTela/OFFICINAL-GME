'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { markInviteAsUsed, updateProfileWithInvite } from '@/actions/invite-validation';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Verificar se usuário está logado
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Usuário não logado, redirecionar para login
          router.push('/login');
          return;
        }

        setUserEmail(user.email || '');
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        router.push('/login');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  // Validar convite
  const handleValidateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const codeUpper = inviteCode.toUpperCase();
      const whatsappClean = whatsapp ? whatsapp.replace(/\D/g, '').trim() : '';

      // If provided, must be 11 digits (DDD+number)
      if (whatsappClean && !/^\d{11}$/.test(whatsappClean)) {
        throw new Error('Número de WhatsApp inválido. Use 11 dígitos, ex: 11999999999');
      }
      console.log('Validando convite:', codeUpper);

      // Validar código no banco
      const { data: invite, error: inviteError } = await supabase
        .from('invites')
        .select('*')
        .eq('code', codeUpper)
        .eq('status', 'unused');

      console.log('Resposta da query invites:', { data: invite, error: inviteError });

      if (inviteError) {
        console.error('Erro na query:', inviteError);
        throw new Error(`Erro ao buscar convite: ${inviteError.message}`);
      }

      if (!invite || invite.length === 0) {
        console.warn('Nenhum convite encontrado com código:', codeUpper);
        throw new Error('Código de convite inválido ou já utilizado');
      }

      const inviteRecord = invite[0];
      console.log('✅ Convite encontrado e válido:', inviteRecord);

      // ======================================
      // MARCAR CONVITE COMO USADO (Server Action)
      // ======================================
      console.log('→ Marcando convite como usado...');
      try {
        const markResult = await markInviteAsUsed(codeUpper, user.id, whatsappClean || null);
        console.log('✅ Convite marcado como usado:', markResult);
      } catch (markErr: any) {
        console.error('❌ Erro ao marcar convite como usado:', markErr);
        const errMsg = markErr instanceof Error ? markErr.message : String(markErr);
        throw new Error(`Erro ao processar convite: ${errMsg}`);
      }

      // ======================================
      // ATUALIZAR PROFILE COM CONVITE (Server Action)
      // ======================================
      console.log('→ Atualizando profile...');
      try {
        const profileResult = await updateProfileWithInvite(user.id, codeUpper, whatsappClean || null);
        console.log('✅ Profile atualizado:', profileResult);
      } catch (profileErr: any) {
        console.error('❌ Erro ao atualizar profile:', profileErr);
        const errMsg = profileErr instanceof Error ? profileErr.message : String(profileErr);
        throw new Error(`Erro ao atualizar perfil: ${errMsg}`);
      }

      // Webhook is sent server-side inside markInviteAsUsed

      console.log('✅ Convite validado e usuário aprovado!');
      setSuccess(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => router.push('/oportunidades'), 2000);
    } catch (err: any) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao validar convite. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex items-center justify-center">
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">GEREZIM</h1>
          <p className="text-gray-400">Acesso Exclusivo</p>
        </div>

        {!success ? (
          <form onSubmit={handleValidateInvite} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Validar Código de Convite</h2>
              <p className="text-gray-400 text-sm">
                Sua conta foi criada com sucesso em {userEmail}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">WhatsApp (DDD + número, ex: 11999999999)</label>
              <Input
                type="text"
                placeholder="11999999999"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 11))}
                disabled={loading}
                inputMode="numeric"
                className="bg-gray-800 border-gray-700"
              />
              <p className="text-xs text-gray-500 mt-2">Opcional — formate como 11 dígitos (DDD + número)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Código de Convite</label>
              <Input
                type="text"
                placeholder="GZM-XXXXXX"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                disabled={loading}
                required
                className="bg-gray-800 border-gray-700"
              />
              <p className="text-xs text-gray-500 mt-2">
                Você recebeu um código junto com o convite
              </p>
            </div>

            {error && <div className="text-red-400 text-sm p-3 bg-red-900 rounded">{error}</div>}

            <Button
              type="submit"
              disabled={loading || !inviteCode}
              className="w-full bg-white text-black hover:bg-gray-200 h-11"
            >
              {loading ? 'Validando...' : 'Validar e Acessar Plataforma'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-sm text-gray-400 hover:text-white"
              >
                ← Voltar para login
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">✅ Bem-vindo!</h2>
            <p className="text-gray-400">Sua conta foi aprovada com sucesso.</p>
            <p className="text-sm text-gray-500">Redirecionando para oportunidades...</p>
          </div>
        )}
      </div>
    </div>
  );
}
