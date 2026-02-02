export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_access_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          description: string | null
          id: string
          is_acknowledged: boolean | null
          severity: string
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_acknowledged?: boolean | null
          severity?: string
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_acknowledged?: boolean | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      admin_allowlist: {
        Row: {
          added_by: string | null
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          email: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Relationships: []
      }
      admin_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_broadcast: boolean | null
          is_read: boolean | null
          message_type: string | null
          read_at: string | null
          recipient_user_id: string | null
          sender_admin_id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_broadcast?: boolean | null
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          recipient_user_id?: string | null
          sender_admin_id: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_broadcast?: boolean | null
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          recipient_user_id?: string | null
          sender_admin_id?: string
          title?: string
        }
        Relationships: []
      }
      body_measurements: {
        Row: {
          arm: number | null
          chest: number | null
          created_at: string
          date: string
          hip: number | null
          id: string
          notes: string | null
          thigh: number | null
          user_id: string
          waist: number | null
        }
        Insert: {
          arm?: number | null
          chest?: number | null
          created_at?: string
          date?: string
          hip?: number | null
          id?: string
          notes?: string | null
          thigh?: number | null
          user_id: string
          waist?: number | null
        }
        Update: {
          arm?: number | null
          chest?: number | null
          created_at?: string
          date?: string
          hip?: number | null
          id?: string
          notes?: string | null
          thigh?: number | null
          user_id?: string
          waist?: number | null
        }
        Relationships: []
      }
      cancellation_logs: {
        Row: {
          cancelled_at: string
          feedback: string | null
          id: string
          reason: string
          reason_category: string | null
          user_id: string
        }
        Insert: {
          cancelled_at?: string
          feedback?: string | null
          id?: string
          reason: string
          reason_category?: string | null
          user_id: string
        }
        Update: {
          cancelled_at?: string
          feedback?: string | null
          id?: string
          reason?: string
          reason_category?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_routines: {
        Row: {
          action_description: string | null
          action_title: string
          completed_at: string | null
          created_at: string
          date: string
          id: string
          is_completed: boolean | null
          time_block: Database["public"]["Enums"]["time_block"]
          user_id: string
        }
        Insert: {
          action_description?: string | null
          action_title: string
          completed_at?: string | null
          created_at?: string
          date?: string
          id?: string
          is_completed?: boolean | null
          time_block: Database["public"]["Enums"]["time_block"]
          user_id: string
        }
        Update: {
          action_description?: string | null
          action_title?: string
          completed_at?: string | null
          created_at?: string
          date?: string
          id?: string
          is_completed?: boolean | null
          time_block?: Database["public"]["Enums"]["time_block"]
          user_id?: string
        }
        Relationships: []
      }
      daily_tips: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          title: string
          trigger_context: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          title: string
          trigger_context?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          title?: string
          trigger_context?: string | null
        }
        Relationships: []
      }
      data_access_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          request_type: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      foods: {
        Row: {
          calories_per_100g: number | null
          carbs_per_100g: number | null
          category: string
          created_at: string
          created_by: string | null
          fat_per_100g: number | null
          id: string
          is_custom: boolean | null
          is_low_carb: boolean | null
          name: string
          protein_per_100g: number | null
          swap_suggestion: string | null
        }
        Insert: {
          calories_per_100g?: number | null
          carbs_per_100g?: number | null
          category: string
          created_at?: string
          created_by?: string | null
          fat_per_100g?: number | null
          id?: string
          is_custom?: boolean | null
          is_low_carb?: boolean | null
          name: string
          protein_per_100g?: number | null
          swap_suggestion?: string | null
        }
        Update: {
          calories_per_100g?: number | null
          carbs_per_100g?: number | null
          category?: string
          created_at?: string
          created_by?: string | null
          fat_per_100g?: number | null
          id?: string
          is_custom?: boolean | null
          is_low_carb?: boolean | null
          name?: string
          protein_per_100g?: number | null
          swap_suggestion?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          due_date: string
          id: string
          invoice_number: string
          paid_at: string | null
          payment_id: string | null
          pdf_url: string | null
          status: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          due_date: string
          id?: string
          invoice_number: string
          paid_at?: string | null
          payment_id?: string | null
          pdf_url?: string | null
          status?: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          due_date?: string
          id?: string
          invoice_number?: string
          paid_at?: string | null
          payment_id?: string | null
          pdf_url?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_logs: {
        Row: {
          calories: number | null
          created_at: string
          date: string
          food_id: string | null
          food_name: string
          id: string
          is_completed: boolean | null
          meal_type: string
          notes: string | null
          portion_grams: number | null
          protein: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          created_at?: string
          date?: string
          food_id?: string | null
          food_name: string
          id?: string
          is_completed?: boolean | null
          meal_type: string
          notes?: string | null
          portion_grams?: number | null
          protein?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          created_at?: string
          date?: string
          food_id?: string | null
          food_name?: string
          id?: string
          is_completed?: boolean | null
          meal_type?: string
          notes?: string | null
          portion_grams?: number | null
          protein?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_logs_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      motivational_messages: {
        Row: {
          category: string | null
          created_at: string
          goal: Database["public"]["Enums"]["user_goal"] | null
          id: string
          message: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          goal?: Database["public"]["Enums"]["user_goal"] | null
          id?: string
          message: string
        }
        Update: {
          category?: string | null
          created_at?: string
          goal?: Database["public"]["Enums"]["user_goal"] | null
          id?: string
          message?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          card_brand: string | null
          card_last_four: string | null
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          pix_code: string | null
          pix_expires_at: string | null
          pix_qr_code_url: string | null
          status: string
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          pix_code?: string | null
          pix_expires_at?: string | null
          pix_qr_code_url?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          pix_code?: string | null
          pix_expires_at?: string | null
          pix_qr_code_url?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cancelled_at: string | null
          created_at: string
          full_name: string | null
          id: string
          last_login_at: string | null
          onboarding_completed: boolean | null
          platform: string | null
          subscription_plan: string | null
          subscription_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cancelled_at?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          onboarding_completed?: boolean | null
          platform?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cancelled_at?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          onboarding_completed?: boolean | null
          platform?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          photo_type: string | null
          photo_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          photo_type?: string | null
          photo_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          photo_type?: string | null
          photo_url?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reengagement_campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          message_content: string
          message_title: string
          name: string
          trigger_hours: number
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          message_content: string
          message_title: string
          name: string
          trigger_hours: number
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          message_content?: string
          message_title?: string
          name?: string
          trigger_hours?: number
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          message: string
          reminder_type: string | null
          scheduled_time: string
          time_block: Database["public"]["Enums"]["time_block"]
          title: string
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          message: string
          reminder_type?: string | null
          scheduled_time: string
          time_block: Database["public"]["Enums"]["time_block"]
          title: string
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          message?: string
          reminder_type?: string | null
          scheduled_time?: string
          time_block?: Database["public"]["Enums"]["time_block"]
          title?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          features: Json | null
          id: string
          interval: string
          interval_count: number
          is_active: boolean
          name: string
          price_cents: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval: string
          interval_count?: number
          is_active?: boolean
          name: string
          price_cents: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string
          interval_count?: number
          is_active?: boolean
          name?: string
          price_cents?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          cancelled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          grace_period_end: string | null
          id: string
          payment_method: string | null
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start?: string
          grace_period_end?: string | null
          id?: string
          payment_method?: string | null
          plan_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          grace_period_end?: string | null
          id?: string
          payment_method?: string | null
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      tea_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          tea_id: string | null
          tea_name: string
          time_consumed: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          tea_id?: string | null
          tea_name: string
          time_consumed?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          tea_id?: string | null
          tea_name?: string
          time_consumed?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tea_logs_tea_id_fkey"
            columns: ["tea_id"]
            isOneToOne: false
            referencedRelation: "teas"
            referencedColumns: ["id"]
          },
        ]
      }
      teas: {
        Row: {
          alternatives: string[] | null
          benefits: string[] | null
          best_time: string | null
          created_at: string
          description: string | null
          id: string
          infusion_time: string | null
          intensity: string | null
          main_benefit: string | null
          name: string
          preparation: string | null
          preparation_ingredients: string[] | null
          preparation_notes: string | null
          preparation_steps: string[] | null
          purpose: string[]
          safety_notes: string | null
          time_of_day: string[] | null
        }
        Insert: {
          alternatives?: string[] | null
          benefits?: string[] | null
          best_time?: string | null
          created_at?: string
          description?: string | null
          id?: string
          infusion_time?: string | null
          intensity?: string | null
          main_benefit?: string | null
          name: string
          preparation?: string | null
          preparation_ingredients?: string[] | null
          preparation_notes?: string | null
          preparation_steps?: string[] | null
          purpose: string[]
          safety_notes?: string | null
          time_of_day?: string[] | null
        }
        Update: {
          alternatives?: string[] | null
          benefits?: string[] | null
          best_time?: string | null
          created_at?: string
          description?: string | null
          id?: string
          infusion_time?: string | null
          intensity?: string | null
          main_benefit?: string | null
          name?: string
          preparation?: string | null
          preparation_ingredients?: string[] | null
          preparation_notes?: string | null
          preparation_steps?: string[] | null
          purpose?: string[]
          safety_notes?: string | null
          time_of_day?: string[] | null
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          created_at: string
          date: string
          id: string
          is_online: boolean | null
          last_activity_at: string | null
          modules_accessed: string[] | null
          session_count: number | null
          total_session_duration_seconds: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          is_online?: boolean | null
          last_activity_at?: string | null
          modules_accessed?: string[] | null
          session_count?: number | null
          total_session_duration_seconds?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_online?: boolean | null
          last_activity_at?: string | null
          modules_accessed?: string[] | null
          session_count?: number | null
          total_session_duration_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_consents: {
        Row: {
          consent_type: string
          created_at: string
          granted_at: string | null
          id: string
          ip_address: string | null
          is_granted: boolean
          revoked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted_at?: string | null
          id?: string
          ip_address?: string | null
          is_granted: boolean
          revoked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted_at?: string | null
          id?: string
          ip_address?: string | null
          is_granted?: boolean
          revoked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          activity_level: Database["public"]["Enums"]["activity_level"] | null
          age: number | null
          available_time_slots:
            | Database["public"]["Enums"]["time_block"][]
            | null
          created_at: string
          current_weight: number | null
          daily_calorie_target: number | null
          diagnosis_summary: string | null
          dietary_restrictions: string[] | null
          food_preference: Database["public"]["Enums"]["food_preference"] | null
          gender: string | null
          goal: Database["public"]["Enums"]["user_goal"] | null
          height: number | null
          id: string
          meals_per_day: number | null
          medical_notes: string | null
          previous_dieting_experience: string | null
          primary_goal: string | null
          protein_target: number | null
          struggles: string[] | null
          target_weight: number | null
          updated_at: string
          user_id: string
          weekly_focus: string | null
        }
        Insert: {
          activity_level?: Database["public"]["Enums"]["activity_level"] | null
          age?: number | null
          available_time_slots?:
            | Database["public"]["Enums"]["time_block"][]
            | null
          created_at?: string
          current_weight?: number | null
          daily_calorie_target?: number | null
          diagnosis_summary?: string | null
          dietary_restrictions?: string[] | null
          food_preference?:
            | Database["public"]["Enums"]["food_preference"]
            | null
          gender?: string | null
          goal?: Database["public"]["Enums"]["user_goal"] | null
          height?: number | null
          id?: string
          meals_per_day?: number | null
          medical_notes?: string | null
          previous_dieting_experience?: string | null
          primary_goal?: string | null
          protein_target?: number | null
          struggles?: string[] | null
          target_weight?: number | null
          updated_at?: string
          user_id: string
          weekly_focus?: string | null
        }
        Update: {
          activity_level?: Database["public"]["Enums"]["activity_level"] | null
          age?: number | null
          available_time_slots?:
            | Database["public"]["Enums"]["time_block"][]
            | null
          created_at?: string
          current_weight?: number | null
          daily_calorie_target?: number | null
          diagnosis_summary?: string | null
          dietary_restrictions?: string[] | null
          food_preference?:
            | Database["public"]["Enums"]["food_preference"]
            | null
          gender?: string | null
          goal?: Database["public"]["Enums"]["user_goal"] | null
          height?: number | null
          id?: string
          meals_per_day?: number | null
          medical_notes?: string | null
          previous_dieting_experience?: string | null
          primary_goal?: string | null
          protein_target?: number | null
          struggles?: string[] | null
          target_weight?: number | null
          updated_at?: string
          user_id?: string
          weekly_focus?: string | null
        }
        Relationships: []
      }
      user_risk_flags: {
        Row: {
          created_at: string
          id: string
          is_resolved: boolean | null
          notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          risk_score: number | null
          risk_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          risk_score?: number | null
          risk_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          risk_score?: number | null
          risk_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number | null
          id: string
          last_active_date: string | null
          longest_streak: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_active_date?: string | null
          longest_streak?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_active_date?: string | null
          longest_streak?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_checkins: {
        Row: {
          adherence_score: number | null
          adjustments: string[] | null
          analysis_summary: string | null
          created_at: string
          id: string
          meals_completed: number | null
          new_calorie_target: number | null
          new_focus: string | null
          teas_consumed: number | null
          user_id: string
          week_start: string
          weight_change: number | null
        }
        Insert: {
          adherence_score?: number | null
          adjustments?: string[] | null
          analysis_summary?: string | null
          created_at?: string
          id?: string
          meals_completed?: number | null
          new_calorie_target?: number | null
          new_focus?: string | null
          teas_consumed?: number | null
          user_id: string
          week_start: string
          weight_change?: number | null
        }
        Update: {
          adherence_score?: number | null
          adjustments?: string[] | null
          analysis_summary?: string | null
          created_at?: string
          id?: string
          meals_completed?: number | null
          new_calorie_target?: number | null
          new_focus?: string | null
          teas_consumed?: number | null
          user_id?: string
          week_start?: string
          weight_change?: number | null
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      activity_level: "low" | "medium" | "high"
      admin_role: "master_admin" | "operational_admin"
      food_preference: "balanced" | "low_carb"
      time_block: "morning" | "lunch" | "afternoon" | "evening"
      user_goal: "lose_weight" | "maintain_weight" | "build_habits"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_level: ["low", "medium", "high"],
      admin_role: ["master_admin", "operational_admin"],
      food_preference: ["balanced", "low_carb"],
      time_block: ["morning", "lunch", "afternoon", "evening"],
      user_goal: ["lose_weight", "maintain_weight", "build_habits"],
    },
  },
} as const
