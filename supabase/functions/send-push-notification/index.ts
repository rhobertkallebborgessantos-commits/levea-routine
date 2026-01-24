import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  url?: string;
  data?: Record<string, unknown>;
}

interface SendNotificationRequest {
  userId?: string;
  payload: PushPayload;
}

interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Web Push implementation for Deno
// Based on RFC 8291 (Message Encryption for Web Push)

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

// Create VAPID JWT token
async function createVapidJwt(
  audience: string,
  subject: string,
  privateKeyBase64: string
): Promise<string> {
  const header = { alg: "ES256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: subject,
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  const privateKeyBytes = base64UrlDecode(privateKeyBase64);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBytes.buffer as ArrayBuffer,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert from DER to raw format if needed
  const signatureBytes = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;
  
  if (signatureBytes.length === 64) {
    // Already in raw format
    r = signatureBytes.slice(0, 32);
    s = signatureBytes.slice(32, 64);
  } else {
    // DER format - parse it
    r = signatureBytes.slice(4, 4 + signatureBytes[3]);
    const sOffset = 4 + signatureBytes[3] + 2;
    s = signatureBytes.slice(sOffset, sOffset + signatureBytes[sOffset - 1]);
    
    // Pad to 32 bytes if needed
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

// Encrypt the payload for Web Push
async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  const userPublicKeyBytes = base64UrlDecode(p256dhKey);
  const authSecretBytes = base64UrlDecode(authSecret);

  // Generate local key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  // Export local public key
  const localPublicKeyRaw = await crypto.subtle.exportKey("raw", localKeyPair.publicKey);
  const localPublicKey = new Uint8Array(localPublicKeyRaw);

  // Import user's public key
  const userPublicKey = await crypto.subtle.importKey(
    "raw",
    userPublicKeyBytes.buffer as ArrayBuffer,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // Derive shared secret
  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: userPublicKey },
    localKeyPair.privateKey,
    256
  );
  const sharedSecret = new Uint8Array(sharedSecretBits);

  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Create info for HKDF
  const encoder = new TextEncoder();
  
  // PRK = HKDF-Extract(salt=auth_secret, IKM=shared_secret)
  const prkKey = await crypto.subtle.importKey(
    "raw",
    authSecretBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const prkBits = await crypto.subtle.sign("HMAC", prkKey, sharedSecret);
  const prk = new Uint8Array(prkBits);

  // Key info: "WebPush: info\x00" + user_public_key + local_public_key
  const keyInfoHeader = encoder.encode("WebPush: info\x00");
  const keyInfo = new Uint8Array(keyInfoHeader.length + userPublicKeyBytes.length + localPublicKey.length);
  keyInfo.set(keyInfoHeader, 0);
  keyInfo.set(userPublicKeyBytes, keyInfoHeader.length);
  keyInfo.set(localPublicKey, keyInfoHeader.length + userPublicKeyBytes.length);

  // IKM = HKDF-Expand(PRK, key_info, 32)
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

  // Derive CEK and nonce using salt
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

  // CEK info: "Content-Encoding: aes128gcm\x00\x01"
  const cekInfo = encoder.encode("Content-Encoding: aes128gcm\x00");
  const cekInfoWithCounter = new Uint8Array(cekInfo.length + 1);
  cekInfoWithCounter.set(cekInfo, 0);
  cekInfoWithCounter[cekInfo.length] = 1;
  const cekBits = await crypto.subtle.sign("HMAC", saltPrkHmacKey, cekInfoWithCounter);
  const cek = new Uint8Array(cekBits).slice(0, 16);

  // Nonce info: "Content-Encoding: nonce\x00\x01"
  const nonceInfo = encoder.encode("Content-Encoding: nonce\x00");
  const nonceInfoWithCounter = new Uint8Array(nonceInfo.length + 1);
  nonceInfoWithCounter.set(nonceInfo, 0);
  nonceInfoWithCounter[nonceInfo.length] = 1;
  const nonceBits = await crypto.subtle.sign("HMAC", saltPrkHmacKey, nonceInfoWithCounter);
  const nonce = new Uint8Array(nonceBits).slice(0, 12);

  // Encrypt payload with AES-GCM
  const payloadBytes = encoder.encode(payload);
  const paddedPayload = new Uint8Array(payloadBytes.length + 1);
  paddedPayload.set(payloadBytes, 0);
  paddedPayload[payloadBytes.length] = 2; // Delimiter

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

// Build the encrypted body in aes128gcm format
function buildEncryptedBody(
  salt: Uint8Array,
  localPublicKey: Uint8Array,
  ciphertext: Uint8Array
): Uint8Array {
  const recordSize = 4096;
  const header = new Uint8Array(86 + ciphertext.length);
  
  // Salt (16 bytes)
  header.set(salt, 0);
  
  // Record size (4 bytes, big-endian)
  const view = new DataView(header.buffer);
  view.setUint32(16, recordSize, false);
  
  // Key ID length (1 byte)
  header[20] = localPublicKey.length;
  
  // Key ID (local public key)
  header.set(localPublicKey, 21);
  
  // Ciphertext
  header.set(ciphertext, 21 + localPublicKey.length);
  
  return header.slice(0, 21 + localPublicKey.length + ciphertext.length);
}

// Send push notification to a single subscription
async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ success: boolean; error?: string; statusCode?: number }> {
  try {
    const endpoint = new URL(subscription.endpoint);
    const audience = `${endpoint.protocol}//${endpoint.host}`;
    
    // Create VAPID JWT
    const jwt = await createVapidJwt(
      audience,
      "mailto:levea@example.com",
      vapidPrivateKey
    );

    // Prepare payload
    const payloadString = JSON.stringify(payload);
    
    // Encrypt payload
    const { ciphertext, salt, localPublicKey } = await encryptPayload(
      payloadString,
      subscription.p256dh,
      subscription.auth
    );

    // Build encrypted body
    const body = buildEncryptedBody(salt, localPublicKey, ciphertext);

    // Send request
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

  console.log("=== Send Push Notification Started ===");

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      throw new Error("VAPID keys not configured. Please add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY secrets.");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { userId, payload }: SendNotificationRequest = await req.json();

    console.log("Sending notification to:", userId || "all users");
    console.log("Payload:", JSON.stringify(payload));

    // Get subscriptions
    let query = supabase.from("push_subscriptions").select("*");
    
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error("Error fetching subscriptions:", error);
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No subscriptions found");
      return new Response(
        JSON.stringify({ 
          success: true, 
          sent: 0, 
          failed: 0,
          message: "No subscriptions found" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${subscriptions.length} subscription(s)`);

    // Prepare the full payload with defaults
    const fullPayload: PushPayload = {
      title: payload.title || "LEVEA",
      body: payload.body || "Hora de cuidar de você! 🌿",
      icon: payload.icon || "/favicon.ico",
      tag: payload.tag || "levea-notification",
      url: payload.url || "/dashboard",
      data: {
        url: payload.url || "/dashboard",
        ...(payload.data || {}),
      },
    };

    // Send to all subscriptions
    const results = await Promise.all(
      subscriptions.map((sub: PushSubscription) =>
        sendPushNotification(sub, fullPayload, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
      )
    );

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;
    
    // Clean up expired subscriptions (410 Gone)
    const expiredIndices = results
      .map((r, i) => (r.statusCode === 410 || r.statusCode === 404 ? i : -1))
      .filter((i) => i !== -1);
    
    if (expiredIndices.length > 0) {
      const expiredEndpoints = expiredIndices.map((i) => subscriptions[i].endpoint);
      console.log(`Cleaning up ${expiredIndices.length} expired subscription(s)`);
      
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints);
    }

    console.log(`=== Push Complete: ${successCount} sent, ${failedCount} failed ===`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount,
        failed: failedCount,
        cleaned: expiredIndices.length,
        message: `Sent ${successCount} notification(s)` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-push-notification:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
