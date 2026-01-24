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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
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
          intensity: string | null
          main_benefit: string | null
          name: string
          preparation: string | null
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
          intensity?: string | null
          main_benefit?: string | null
          name: string
          preparation?: string | null
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
          intensity?: string | null
          main_benefit?: string | null
          name?: string
          preparation?: string | null
          purpose?: string[]
          safety_notes?: string | null
          time_of_day?: string[] | null
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
      [_ in never]: never
    }
    Enums: {
      activity_level: "low" | "medium" | "high"
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
      food_preference: ["balanced", "low_carb"],
      time_block: ["morning", "lunch", "afternoon", "evening"],
      user_goal: ["lose_weight", "maintain_weight", "build_habits"],
    },
  },
} as const
