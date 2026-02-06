import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppMessage {
  to: string; // Phone number with country code (e.g., 5511999999999)
  message: string;
  type?: 'notification' | 'verification' | 'reminder' | 'support';
}

const GRAPH_API_VERSION = 'v18.0';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request body
    const { to, message, type = 'notification' }: WhatsAppMessage = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Format phone number (remove + if present, ensure only digits)
    const formattedPhone = to.replace(/\D/g, '');

    // Send message via Meta Graph API
    const graphApiUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;
    
    const requestBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: message
      }
    };

    console.log(`Sending WhatsApp message to ${formattedPhone}, type: ${type}`);

    const metaResponse = await fetch(graphApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const metaData = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error('Meta API error:', metaData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send WhatsApp message', 
          details: metaData.error?.message || 'Unknown error' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`WhatsApp message sent successfully. Message ID: ${metaData.messages?.[0]?.id}, Type: ${type}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: metaData.messages?.[0]?.id,
        status: 'sent'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
