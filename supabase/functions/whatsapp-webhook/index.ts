import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-twilio-signature',
};

// Simple FAQ responses for the chatbot
const faqResponses: Record<string, string> = {
  'ola': '👋 Olá! Sou o assistente do LEVEA. Como posso ajudar?\n\nDigite:\n1️⃣ - Sobre o LEVEA\n2️⃣ - Como funciona\n3️⃣ - Falar com suporte',
  'oi': '👋 Olá! Sou o assistente do LEVEA. Como posso ajudar?\n\nDigite:\n1️⃣ - Sobre o LEVEA\n2️⃣ - Como funciona\n3️⃣ - Falar com suporte',
  '1': '🌿 O LEVEA é um sistema de emagrecimento saudável e sustentável, focado em organização de rotina e lembretes inteligentes. Não é uma dieta restritiva, mas sim um método que prioriza consistência e adesão para resultados duradouros.',
  '2': '📱 O LEVEA funciona através de módulos que incluem:\n\n• Registro de refeições\n• Sistema de chás personalizados\n• Lembretes inteligentes\n• Acompanhamento de progresso\n• Análise semanal\n\nTudo personalizado para suas metas!',
  '3': '📞 Para falar com nosso suporte humano, envie um e-mail para rk.suportee@gmail.com ou aguarde que um atendente entrará em contato em breve.',
  'ajuda': '🆘 Comandos disponíveis:\n\n• "oi" ou "ola" - Menu principal\n• "1" - Sobre o LEVEA\n• "2" - Como funciona\n• "3" - Falar com suporte\n• "cancelar" - Informações sobre cancelamento',
  'cancelar': '❌ Para cancelar sua assinatura, acesse o app LEVEA > Configurações > Assinatura. Lá você encontra opções para cancelar, pausar ou alterar seu plano.',
};

function getResponse(message: string): string {
  const normalizedMessage = message.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Check for exact matches first
  if (faqResponses[normalizedMessage]) {
    return faqResponses[normalizedMessage];
  }
  
  // Check for keywords
  if (normalizedMessage.includes('cancelar') || normalizedMessage.includes('cancelamento')) {
    return faqResponses['cancelar'];
  }
  if (normalizedMessage.includes('ajuda') || normalizedMessage.includes('help')) {
    return faqResponses['ajuda'];
  }
  if (normalizedMessage.includes('ola') || normalizedMessage.includes('oi') || normalizedMessage.includes('bom dia') || normalizedMessage.includes('boa tarde') || normalizedMessage.includes('boa noite')) {
    return faqResponses['ola'];
  }
  
  // Default response
  return '🤔 Não entendi sua mensagem. Digite "ajuda" para ver os comandos disponíveis ou "3" para falar com nosso suporte.';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Handle GET request for webhook verification
  if (req.method === 'GET') {
    return new Response('Webhook is active', { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
    });
  }

  try {
    // Parse incoming webhook from Twilio
    const formData = await req.formData();
    
    const from = formData.get('From')?.toString() || '';
    const body = formData.get('Body')?.toString() || '';
    const messageSid = formData.get('MessageSid')?.toString() || '';
    
    console.log(`Received WhatsApp message from ${from}: ${body} (SID: ${messageSid})`);

    // Extract phone number (remove "whatsapp:" prefix)
    const phoneNumber = from.replace('whatsapp:', '');

    // Get response based on message content
    const responseMessage = getResponse(body);

    // Get Twilio credentials to send response
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    if (!accountSid || !authToken || !twilioWhatsAppNumber) {
      console.error('Missing Twilio credentials for response');
      // Return TwiML empty response
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/xml' } 
        }
      );
    }

    // Send response via Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const responseFormData = new URLSearchParams();
    responseFormData.append('From', `whatsapp:${twilioWhatsAppNumber}`);
    responseFormData.append('To', from);
    responseFormData.append('Body', responseMessage);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: responseFormData.toString(),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio response error:', twilioData);
    } else {
      console.log(`Response sent successfully. SID: ${twilioData.sid}`);
    }

    // Log conversation to database (optional - for analytics)
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      // You can create a whatsapp_logs table if you want to track conversations
      // await supabase.from('whatsapp_logs').insert({
      //   phone_number: phoneNumber,
      //   message_received: body,
      //   message_sent: responseMessage,
      //   message_sid: messageSid,
      // });
    } catch (dbError) {
      console.error('Error logging to database:', dbError);
    }

    // Return empty TwiML response (we're sending via API instead)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/xml' } 
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/xml' } 
      }
    );
  }
});
