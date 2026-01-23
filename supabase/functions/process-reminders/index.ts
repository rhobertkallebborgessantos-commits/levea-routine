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

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
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

    // Store pending notifications in a table for the frontend to poll
    // This is a simpler approach that works reliably
    const pendingNotifications: Array<{
      user_id: string;
      title: string;
      body: string;
      time_block: string;
      reminder_id: string;
      created_at: string;
    }> = [];

    for (const reminder of reminders as Reminder[]) {
      const userSubs = userSubscriptions.get(reminder.user_id);
      if (!userSubs || userSubs.length === 0) {
        console.log(`No subscription for user ${reminder.user_id}`);
        continue;
      }

      const blockLabel = TIME_BLOCK_LABELS[reminder.time_block] || reminder.time_block;
      
      pendingNotifications.push({
        user_id: reminder.user_id,
        title: reminder.title || `Lembrete ${blockLabel}`,
        body: reminder.message || `Hora de cuidar da sua saúde! 🌿`,
        time_block: reminder.time_block,
        reminder_id: reminder.id,
        created_at: new Date().toISOString(),
      });
    }

    console.log(`=== Process Reminders Complete ===`);
    console.log(`Prepared ${pendingNotifications.length} notification(s)`);

    return new Response(
      JSON.stringify({
        success: true,
        remindersProcessed: reminders.length,
        subscriptionsFound: subscriptions.length,
        notificationsPrepared: pendingNotifications.length,
        notifications: pendingNotifications,
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
