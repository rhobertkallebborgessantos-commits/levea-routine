import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailRequest {
  userId: string;
  emailType: "cancellation" | "reactivation";
  planName?: string;
  periodEnd?: string;
}

const getEmailContent = (type: "cancellation" | "reactivation", planName: string, periodEnd: string) => {
  if (type === "cancellation") {
    return {
      subject: "Sua assinatura foi cancelada - Protocolo Emagreça",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <h1 style="color: #18181b; font-size: 24px; margin-bottom: 20px; text-align: center;">
                Cancelamento Agendado
              </h1>
              
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Olá! Recebemos sua solicitação de cancelamento da assinatura do <strong>Protocolo Emagreça</strong>.
              </p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>Importante:</strong> Você ainda terá acesso completo até <strong>${periodEnd}</strong>.
                </p>
              </div>
              
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Plano cancelado: <strong>${planName}</strong>
              </p>
              
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Sentiremos sua falta! Se mudar de ideia, você pode reativar sua assinatura a qualquer momento antes do término do período.
              </p>
              
              <div style="text-align: center;">
                <a href="https://app.protocoloemagreca.com/subscription" style="display: inline-block; background-color: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Reativar Assinatura
                </a>
              </div>
              
              <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 40px;">
                Se você não solicitou este cancelamento, por favor entre em contato conosco.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  return {
    subject: "Assinatura reativada! - Protocolo Emagreça",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <h1 style="color: #18181b; font-size: 24px; margin-bottom: 20px; text-align: center;">
              🎉 Bem-vindo(a) de volta!
            </h1>
            
            <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Sua assinatura do <strong>Protocolo Emagreça</strong> foi reativada com sucesso!
            </p>
            
            <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #065f46; margin: 0; font-size: 14px;">
                <strong>Ótimo!</strong> Você continua com acesso completo a todos os recursos.
              </p>
            </div>
            
            <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Plano ativo: <strong>${planName}</strong>
            </p>
            
            <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Continue sua jornada de transformação! Estamos aqui para te ajudar a alcançar seus objetivos.
            </p>
            
            <div style="text-align: center;">
              <a href="https://app.protocoloemagreca.com/dashboard" style="display: inline-block; background-color: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Acessar o App
              </a>
            </div>
            
            <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 40px;">
              Obrigado por continuar conosco!
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, emailType, planName = "Premium", periodEnd = "" }: EmailRequest = await req.json();

    if (!userId || !emailType) {
      throw new Error("Missing required fields: userId and emailType");
    }

    console.log(`Processing ${emailType} email for user ${userId}`);

    // Create Supabase client to get user email
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user email from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      console.error("Failed to get user email:", userError);
      throw new Error("Could not retrieve user email");
    }

    const userEmail = userData.user.email;
    console.log(`Sending ${emailType} email to ${userEmail}`);

    const { subject, html } = getEmailContent(emailType, planName, periodEnd);

    const emailResponse = await resend.emails.send({
      from: "Protocolo Emagreça <noreply@levea.com>",
      to: [userEmail],
      subject,
      html,
    });

    console.log(`Email sent successfully:`, emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-subscription-email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
