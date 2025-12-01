import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gerezim.com';

export async function sendWelcomeEmail({
  email,
  name,
  tempPassword,
}: {
  email: string;
  name: string;
  tempPassword: string;
}) {
  try {
    await resend.emails.send({
      from: 'noreply@gerezim.com',
      to: email,
      subject: '🎉 Bem-vindo à GEREZIM!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Olá ${name}!</h2>
          <p>Sua solicitação foi aprovada! 🎊</p>
          <p>Agora você tem acesso exclusivo às oportunidades premium da GEREZIM.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Senha temporária:</strong> ${tempPassword}</p>
            <p style="color: #ff4444;"><small>⚠️ Altere esta senha ao fazer login!</small></p>
          </div>
          
          <p>
            <a href="${APP_URL}/login" style="background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Acessar Plataforma
            </a>
          </p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            Dúvidas? Entre em contato: support@gerezim.com
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
    throw error;
  }
}

export async function sendRejectionEmail({
  email,
  name,
  reason,
}: {
  email: string;
  name: string;
  reason: string;
}) {
  try {
    await resend.emails.send({
      from: 'noreply@gerezim.com',
      to: email,
      subject: 'Atualização sobre sua solicitação - GEREZIM',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Olá ${name},</h2>
          <p>Agradecemos seu interesse em fazer parte da GEREZIM.</p>
          <p>Infelizmente, sua solicitação não foi aprovada nesta rodada.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Motivo:</strong></p>
            <p>${reason}</p>
          </div>
          
          <p>Você pode replicar sua solicitação com um novo convite no futuro.</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            Dúvidas? Entre em contato: support@gerezim.com
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Erro ao enviar email de rejeição:', error);
    throw error;
  }
}
