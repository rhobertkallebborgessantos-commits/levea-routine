import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GRAPH_API_VERSION = 'v18.0';

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

async function sendWhatsAppMessage(phoneNumberId: string, accessToken: string, to: string, message: string) {
  const graphApiUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;
  
  const requestBody = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to,
    type: 'text',
    text: {
      preview_url: false,
      body: message
    }
  };

  const response = await fetch(graphApiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  return response.json();
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // Handle webhook verification (GET request from Meta)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const verifyToken = Deno.env.get('META_WHATSAPP_VERIFY_TOKEN');

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('Webhook verified successfully');
      return new Response(challenge, { 
        status: 200, 
        headers: { 'Content-Type': 'text/plain' } 
      });
    } else {
      console.error('Webhook verification failed');
      return new Response('Forbidden', { status: 403 });
    }
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Meta WhatsApp credentials
    const phoneNumberId = Deno.env.get('META_WHATSAPP_PHONE_ID');
    const accessToken = Deno.env.get('META_WHATSAPP_ACCESS_TOKEN');

    if (!phoneNumberId || !accessToken) {
      console.error('Missing Meta WhatsApp credentials');
      return new Response(
        JSON.stringify({ error: 'WhatsApp service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse incoming webhook from Meta
    const body = await req.json();
    
    console.log('Received webhook:', JSON.stringify(body, null, 2));

    // Check if this is a WhatsApp message notification
    if (body.object !== 'whatsapp_business_account') {
      return new Response(
        JSON.stringify({ status: 'ignored' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process each entry
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;

        const value = change.value;
        const messages = value.messages || [];

        for (const message of messages) {
          // Only process text messages
          if (message.type !== 'text') continue;

          const from = message.from; // Sender's phone number
          const text = message.text?.body || '';
          const messageId = message.id;

          console.log(`Received message from ${from}: ${text} (ID: ${messageId})`);

          // Get chatbot response
          const responseMessage = getResponse(text);

          // Send response
          try {
            const result = await sendWhatsAppMessage(phoneNumberId, accessToken, from, responseMessage);
            console.log(`Response sent successfully:`, result);
          } catch (sendError) {
            console.error('Error sending response:', sendError);
          }
        }
      }
    }

    // Log conversation to database (optional - for analytics)
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      // You can create a whatsapp_logs table if you want to track conversations
      // await supabase.from('whatsapp_logs').insert({
      //   phone_number: from,
      //   message_received: text,
      //   message_sent: responseMessage,
      // });
    } catch (dbError) {
      console.error('Error logging to database:', dbError);
    }

    // Return 200 to acknowledge receipt
    return new Response(
      JSON.stringify({ status: 'processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    // Still return 200 to prevent Meta from retrying
    return new Response(
      JSON.stringify({ status: 'error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
