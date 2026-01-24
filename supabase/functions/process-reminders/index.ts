import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Reminder {
  id: string;
  user_id: string;
  time_block: string;
  scheduled_time: string;
  title: string;
  message: string;
  is_active: boolean;
  reminder_type: string | null;
  category: string | null;
}

interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Time block to friendly name mapping
const TIME_BLOCK_LABELS: Record<string, string> = {
  morning: "☀️ Manhã",
  lunch: "🍽️ Almoço",
  afternoon: "🌤️ Tarde",
  evening: "🌙 Noite",
};

// Category to emoji mapping
const CATEGORY_ICONS: Record<string, string> = {
  meal: "🍽️",
  tea: "🍵",
  routine: "✨",
  exercise: "💪",
  hydration: "💧",
  supplement: "💊",
  general: "🌿",
};

// Web Push implementation functions
function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const padding = '='.repeat((4 - str.length % 4) % 4);
  const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function createVapidJwt(
  audience: string,
  subject: string,
  privateKeyBase64: string
): Promise<string> {
  const header = { alg: "ES256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60,
    sub: subject,
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const privateKeyBytes = base64UrlDecode(privateKeyBase64);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBytes.buffer as ArrayBuffer,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureBytes = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;
  
  if (signatureBytes.length === 64) {
    r = signatureBytes.slice(0, 32);
    s = signatureBytes.slice(32, 64);
  } else {
    r = signatureBytes.slice(4, 4 + signatureBytes[3]);
    const sOffset = 4 + signatureBytes[3] + 2;
    s = signatureBytes.slice(sOffset, sOffset + signatureBytes[sOffset - 1]);
    
    if (r.length < 32) {
      const padded = new Uint8Array(32);
      padded.set(r, 32 - r.length);
      r = padded;
    }
    if (s.length < 32) {
      const padded = new Uint8Array(32);
      padded.set(s, 32 - s.length);
      s = padded;
    }
  }

  const rawSignature = new Uint8Array(64);
  rawSignature.set(r.length > 32 ? r.slice(r.length - 32) : r, 32 - Math.min(r.length, 32));
  rawSignature.set(s.length > 32 ? s.slice(s.length - 32) : s, 32 + 32 - Math.min(s.length, 32));

  return `${unsignedToken}.${base64UrlEncode(rawSignature)}`;
}

async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  const userPublicKeyBytes = base64UrlDecode(p256dhKey);
  const authSecretBytes = base64UrlDecode(authSecret);

  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const localPublicKeyRaw = await crypto.subtle.exportKey("raw", localKeyPair.publicKey);
  const localPublicKey = new Uint8Array(localPublicKeyRaw);

  const userPublicKey = await crypto.subtle.importKey(
    "raw",
    userPublicKeyBytes.buffer as ArrayBuffer,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: userPublicKey },
    localKeyPair.privateKey,
    256
  );
  const sharedSecret = new Uint8Array(sharedSecretBits);

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const encoder = new TextEncoder();
  
  const prkKey = await crypto.subtle.importKey(
    "raw",
    authSecretBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const prkBits = await crypto.subtle.sign("HMAC", prkKey, sharedSecret);
  const prk = new Uint8Array(prkBits);

  const keyInfoHeader = encoder.encode("WebPush: info\x00");
  const keyInfo = new Uint8Array(keyInfoHeader.length + userPublicKeyBytes.length + localPublicKey.length);
  keyInfo.set(keyInfoHeader, 0);
  keyInfo.set(userPublicKeyBytes, keyInfoHeader.length);
  keyInfo.set(localPublicKey, keyInfoHeader.length + userPublicKeyBytes.length);

  const ikmKey = await crypto.subtle.importKey(
    "raw",
    prk.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const ikmInfoWithCounter = new Uint8Array(keyInfo.length + 1);
  ikmInfoWithCounter.set(keyInfo, 0);
  ikmInfoWithCounter[keyInfo.length] = 1;
  const ikmBits = await crypto.subtle.sign("HMAC", ikmKey, ikmInfoWithCounter);
  const ikm = new Uint8Array(ikmBits).slice(0, 32);

  const saltPrkKey = await crypto.subtle.importKey(
    "raw",
    salt.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const saltPrkBits = await crypto.subtle.sign("HMAC", saltPrkKey, ikm);
  const saltPrk = new Uint8Array(saltPrkBits);

  const saltPrkHmacKey = await crypto.subtle.importKey(
    "raw",
    saltPrk.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const cekInfo = encoder.encode("Content-Encoding: aes128gcm\x00");
  const cekInfoWithCounter = new Uint8Array(cekInfo.length + 1);
  cekInfoWithCounter.set(cekInfo, 0);
  cekInfoWithCounter[cekInfo.length] = 1;
  const cekBits = await crypto.subtle.sign("HMAC", saltPrkHmacKey, cekInfoWithCounter);
  const cek = new Uint8Array(cekBits).slice(0, 16);

  const nonceInfo = encoder.encode("Content-Encoding: nonce\x00");
  const nonceInfoWithCounter = new Uint8Array(nonceInfo.length + 1);
  nonceInfoWithCounter.set(nonceInfo, 0);
  nonceInfoWithCounter[nonceInfo.length] = 1;
  const nonceBits = await crypto.subtle.sign("HMAC", saltPrkHmacKey, nonceInfoWithCounter);
  const nonce = new Uint8Array(nonceBits).slice(0, 12);

  const payloadBytes = encoder.encode(payload);
  const paddedPayload = new Uint8Array(payloadBytes.length + 1);
  paddedPayload.set(payloadBytes, 0);
  paddedPayload[payloadBytes.length] = 2;

  const encryptionKey = await crypto.subtle.importKey(
    "raw",
    cek.buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const ciphertextBits = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    encryptionKey,
    paddedPayload
  );
  const ciphertext = new Uint8Array(ciphertextBits);

  return { ciphertext, salt, localPublicKey };
}

function buildEncryptedBody(
  salt: Uint8Array,
  localPublicKey: Uint8Array,
  ciphertext: Uint8Array
): Uint8Array {
  const recordSize = 4096;
  const header = new Uint8Array(86 + ciphertext.length);
  
  header.set(salt, 0);
  
  const view = new DataView(header.buffer);
  view.setUint32(16, recordSize, false);
  
  header[20] = localPublicKey.length;
  header.set(localPublicKey, 21);
  header.set(ciphertext, 21 + localPublicKey.length);
  
  return header.slice(0, 21 + localPublicKey.length + ciphertext.length);
}

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  url?: string;
  data?: Record<string, unknown>;
}

async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ success: boolean; error?: string; statusCode?: number }> {
  try {
    const endpoint = new URL(subscription.endpoint);
    const audience = `${endpoint.protocol}//${endpoint.host}`;
    
    const jwt = await createVapidJwt(
      audience,
      "mailto:levea@example.com",
      vapidPrivateKey
    );

    const payloadString = JSON.stringify(payload);
    
    const { ciphertext, salt, localPublicKey } = await encryptPayload(
      payloadString,
      subscription.p256dh,
      subscription.auth
    );

    const body = buildEncryptedBody(salt, localPublicKey, ciphertext);

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        "Authorization": `vapid t=${jwt}, k=${vapidPublicKey}`,
        "TTL": "86400",
        "Urgency": "normal",
      },
      body: body.buffer as ArrayBuffer,
    });

    if (response.status === 201 || response.status === 200) {
      return { success: true, statusCode: response.status };
    }

    const errorText = await response.text();
    console.error(`Push failed with status ${response.status}:`, errorText);
    
    return { 
      success: false, 
      error: `HTTP ${response.status}: ${errorText}`,
      statusCode: response.status 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending push:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("=== Process Reminders Started ===");
  console.log("Timestamp:", new Date().toISOString());

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.warn("VAPID keys not configured - push notifications disabled");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get current time in HH:MM format (UTC)
    const now = new Date();
    const currentHour = now.getUTCHours().toString().padStart(2, "0");
    const currentMinute = now.getUTCMinutes();

    // We check reminders within a 5-minute window to account for cron timing
    const minuteStart = Math.floor(currentMinute / 5) * 5;
    const timeWindowStart = `${currentHour}:${minuteStart.toString().padStart(2, "0")}`;
    const minuteEnd = minuteStart + 4;
    const timeWindowEnd = `${currentHour}:${minuteEnd.toString().padStart(2, "0")}`;

    console.log(`Checking reminders for time window: ${timeWindowStart} - ${timeWindowEnd}`);

    // Fetch active reminders that should fire now
    const { data: reminders, error: remindersError } = await supabase
      .from("reminders")
      .select("*")
      .eq("is_active", true)
      .gte("scheduled_time", timeWindowStart + ":00")
      .lte("scheduled_time", timeWindowEnd + ":59");

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError);
      throw remindersError;
    }

    if (!reminders || reminders.length === 0) {
      console.log("No reminders scheduled for this time window");
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No reminders due" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${reminders.length} reminder(s) to process`);

    // Get unique user IDs from reminders
    const userIds = [...new Set(reminders.map((r: Reminder) => r.user_id))];

    // Fetch push subscriptions for these users
    const { data: subscriptions, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", userIds);

    if (subsError) {
      console.error("Error fetching subscriptions:", subsError);
      throw subsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No push subscriptions found for users with due reminders");
      return new Response(
        JSON.stringify({
          success: true,
          sent: 0,
          message: "No subscriptions for users with due reminders",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${subscriptions.length} subscription(s) to notify`);

    // Create a map of user_id to their subscriptions
    const userSubscriptions = new Map<string, PushSubscription[]>();
    subscriptions.forEach((sub: PushSubscription) => {
      const existing = userSubscriptions.get(sub.user_id) || [];
      existing.push(sub);
      userSubscriptions.set(sub.user_id, existing);
    });

    // Send notifications
    let sentCount = 0;
    let failedCount = 0;
    const expiredEndpoints: string[] = [];

    for (const reminder of reminders as Reminder[]) {
      const userSubs = userSubscriptions.get(reminder.user_id);
      if (!userSubs || userSubs.length === 0) {
        console.log(`No subscription for user ${reminder.user_id}`);
        continue;
      }

      const blockLabel = TIME_BLOCK_LABELS[reminder.time_block] || reminder.time_block;
      const categoryIcon = CATEGORY_ICONS[reminder.category || "general"] || "🌿";
      
      const payload: PushPayload = {
        title: reminder.title || `${categoryIcon} Lembrete ${blockLabel}`,
        body: reminder.message || "Hora de cuidar da sua saúde! 🌿",
        icon: "/favicon.ico",
        tag: `reminder-${reminder.id}`,
        url: "/dashboard",
        data: {
          url: "/dashboard",
          reminderId: reminder.id,
          timeBlock: reminder.time_block,
          category: reminder.category,
        },
      };

      // Send to all user subscriptions
      if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
        for (const sub of userSubs) {
          const result = await sendPushNotification(sub, payload, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
          if (result.success) {
            sentCount++;
            console.log(`✓ Sent notification to ${reminder.user_id}`);
          } else {
            failedCount++;
            console.log(`✗ Failed to send to ${reminder.user_id}: ${result.error}`);
            
            // Track expired subscriptions for cleanup
            if (result.statusCode === 410 || result.statusCode === 404) {
              expiredEndpoints.push(sub.endpoint);
            }
          }
        }
      }
    }

    // Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      console.log(`Cleaning up ${expiredEndpoints.length} expired subscription(s)`);
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints);
    }

    console.log(`=== Process Reminders Complete ===`);
    console.log(`Sent: ${sentCount}, Failed: ${failedCount}, Cleaned: ${expiredEndpoints.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        remindersProcessed: reminders.length,
        subscriptionsFound: subscriptions.length,
        notificationsSent: sentCount,
        notificationsFailed: failedCount,
        expiredCleaned: expiredEndpoints.length,
        message: `Sent ${sentCount} notification(s)`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in process-reminders:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
