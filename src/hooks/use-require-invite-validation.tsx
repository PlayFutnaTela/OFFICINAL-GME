'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Hook para proteger rotas que requerem validação de convite
 * Se o usuário não tiver um invite_code preenchido, redireciona para /auth/register
 */
export function useRequireInviteValidation() {
  const router = useRouter();
  const supabase = createClient();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkInviteValidation = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // Usuário não logado, redirecionar para login
          router.push('/login');
          return;
        }

        // Buscar profile para verificar se tem invite_code
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('invite_code')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar profile:', error);
          router.push('/auth/register');
          return;
        }

        // Se não tem invite_code, não completou o processo
        if (!profile?.invite_code) {
          console.warn('Usuário sem invite_code validado, redirecionando para /auth/register');
          router.push('/auth/register');
          return;
        }

        // Usuário válido, pode continuar
        setIsChecking(false);
      } catch (err) {
        console.error('Erro na verificação de invite:', err);
        router.push('/auth/register');
      }
    };

    checkInviteValidation();
  }, [router, supabase]);

  return { isChecking };
}
