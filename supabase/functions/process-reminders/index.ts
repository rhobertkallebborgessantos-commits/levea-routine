import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import webPush from "https://esm.sh/web-push@3.6.7";

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
  morning: "Manhã",
  lunch: "Almoço",
  afternoon: "Tarde",
  evening: "Noite",
};

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
      throw new Error("VAPID keys missing");
    }

    // Configure web-push
    webPush.setVapidDetails(
      "mailto:levea@app.com",
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get current time in HH:MM format (UTC)
    const now = new Date();
    const currentHour = now.getUTCHours().toString().padStart(2, "0");
    const currentMinute = now.getUTCMinutes().toString().padStart(2, "0");
    const currentTime = `${currentHour}:${currentMinute}`;

    // We check reminders within a 5-minute window to account for cron timing
    const minuteStart = Math.floor(now.getUTCMinutes() / 5) * 5;
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
          message: "No subscriptions for users with due reminders" 
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
    const failedSubscriptions: string[] = [];

    for (const reminder of reminders as Reminder[]) {
      const userSubs = userSubscriptions.get(reminder.user_id);
      if (!userSubs || userSubs.length === 0) {
        console.log(`No subscription for user ${reminder.user_id}`);
        continue;
      }

      const blockLabel = TIME_BLOCK_LABELS[reminder.time_block] || reminder.time_block;
      const payload = JSON.stringify({
        title: reminder.title || `Lembrete ${blockLabel}`,
        body: reminder.message || `Hora de cuidar da sua saúde! 🌿`,
        icon: "/favicon.ico",
        tag: `levea-${reminder.time_block}`,
        data: {
          url: "/dashboard",
          reminderId: reminder.id,
          timeBlock: reminder.time_block,
        },
      });

      for (const sub of userSubs) {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          await webPush.sendNotification(pushSubscription, payload);
          sentCount++;
          console.log(`Sent notification to user ${sub.user_id}`);
        } catch (pushError: unknown) {
          failedCount++;
          const errorMessage = pushError instanceof Error ? pushError.message : "Unknown error";
          console.error(`Failed to send to ${sub.user_id}:`, errorMessage);

          // If subscription is invalid, mark for removal
          if (
            errorMessage.includes("410") ||
            errorMessage.includes("404") ||
            errorMessage.includes("expired")
          ) {
            failedSubscriptions.push(sub.id);
          }
        }
      }
    }

    // Clean up invalid subscriptions
    if (failedSubscriptions.length > 0) {
      console.log(`Removing ${failedSubscriptions.length} invalid subscription(s)`);
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("id", failedSubscriptions);
    }

    console.log(`=== Process Reminders Complete ===`);
    console.log(`Sent: ${sentCount}, Failed: ${failedCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
        cleaned: failedSubscriptions.length,
        message: `Processed ${reminders.length} reminder(s)`,
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
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
