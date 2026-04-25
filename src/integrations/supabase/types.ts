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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_comments: {
        Row: {
          approved: boolean
          author_email: string
          author_name: string
          body: string
          created_at: string
          id: string
          post_slug: string
        }
        Insert: {
          approved?: boolean
          author_email: string
          author_name: string
          body: string
          created_at?: string
          id?: string
          post_slug: string
        }
        Update: {
          approved?: boolean
          author_email?: string
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          post_slug?: string
        }
        Relationships: []
      }
      rebate_estimates: {
        Row: {
          created_at: string
          current_heating: string | null
          email: string
          estimated_total: number
          home_type: string
          id: string
          name: string
          phone: string | null
          programs: Json
          system_type: string
          zip: string
        }
        Insert: {
          created_at?: string
          current_heating?: string | null
          email: string
          estimated_total?: number
          home_type: string
          id?: string
          name: string
          phone?: string | null
          programs?: Json
          system_type: string
          zip: string
        }
        Update: {
          created_at?: string
          current_heating?: string | null
          email?: string
          estimated_total?: number
          home_type?: string
          id?: string
          name?: string
          phone?: string | null
          programs?: Json
          system_type?: string
          zip?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          customer_id: string | null
          full_name: string
          email: string | null
          phone: string | null
          address_line1: string | null
          city: string | null
          state: string | null
          zip: string | null
          property_type: string | null
          service_requested: string | null
          urgency: string
          source: string
          source_url: string | null
          source_referrer: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          notes: string | null
          status: string
          tags: string[]
          assigned_staff_id: string | null
          assigned_tech_id: string | null
          last_contact_at: string | null
          next_follow_up_at: string | null
          appointment_at: string | null
          call_outcome: string | null
          estimate_amount: number | null
          job_value: number | null
          maintenance_plan_status: string | null
          transcript_url: string | null
          transcript_text: string | null
          call_summary: string | null
          disposition: string | null
          spam_score: number
          honeypot_value: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          full_name: string
          email?: string | null
          phone?: string | null
          address_line1?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          property_type?: string | null
          service_requested?: string | null
          urgency?: string
          source: string
          source_url?: string | null
          source_referrer?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          notes?: string | null
          status?: string
          tags?: string[]
          assigned_staff_id?: string | null
          assigned_tech_id?: string | null
          last_contact_at?: string | null
          next_follow_up_at?: string | null
          appointment_at?: string | null
          call_outcome?: string | null
          estimate_amount?: number | null
          job_value?: number | null
          maintenance_plan_status?: string | null
          transcript_url?: string | null
          transcript_text?: string | null
          call_summary?: string | null
          disposition?: string | null
          spam_score?: number
          honeypot_value?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          full_name?: string
          email?: string | null
          phone?: string | null
          address_line1?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          property_type?: string | null
          service_requested?: string | null
          urgency?: string
          source?: string
          source_url?: string | null
          source_referrer?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          notes?: string | null
          status?: string
          tags?: string[]
          assigned_staff_id?: string | null
          assigned_tech_id?: string | null
          last_contact_at?: string | null
          next_follow_up_at?: string | null
          appointment_at?: string | null
          call_outcome?: string | null
          estimate_amount?: number | null
          job_value?: number | null
          maintenance_plan_status?: string | null
          transcript_url?: string | null
          transcript_text?: string | null
          call_summary?: string | null
          disposition?: string | null
          spam_score?: number
          honeypot_value?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "office" | "office_staff" | "tech" | "marketing" | "user"
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
      app_role: ["admin", "office", "office_staff", "tech", "marketing", "user"],
    },
  },
} as const
