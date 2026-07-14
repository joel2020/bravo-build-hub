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
      activity_log: {
        Row: {
          action: string
          created_at: string
          created_by: string | null
          details: string | null
          id: string
          invoice_id: string | null
          job_id: string | null
          lead_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          created_by?: string | null
          details?: string | null
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          lead_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          created_by?: string | null
          details?: string | null
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      follow_ups: {
        Row: {
          completed: boolean
          created_at: string
          created_by: string | null
          due_date: string
          id: string
          job_id: string | null
          lead_id: string | null
          note: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          created_by?: string | null
          due_date: string
          id?: string
          job_id?: string | null
          lead_id?: string | null
          note?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          created_by?: string | null
          due_date?: string
          id?: string
          job_id?: string | null
          lead_id?: string | null
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          due_at: string | null
          due_date: string | null
          id: string
          invoice_number: string
          job_id: string
          lead_id: string | null
          notes: string | null
          paid_date: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          total: number
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          due_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          job_id: string
          lead_id?: string | null
          notes?: string | null
          paid_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          total?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          job_id?: string
          lead_id?: string | null
          notes?: string | null
          paid_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          address: string | null
          amount: number | null
          assigned_to: string | null
          completed_at: string | null
          completed_date: string | null
          completion_summary: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          description: string | null
          dispatch_notes: string | null
          id: string
          job_type: string | null
          lead_id: string
          notes: string | null
          scheduled_at: string | null
          scheduled_date: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["job_status"]
          technician_id: string | null
          title: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          amount?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          completed_date?: string | null
          completion_summary?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          description?: string | null
          dispatch_notes?: string | null
          id?: string
          job_type?: string | null
          lead_id: string
          notes?: string | null
          scheduled_at?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          technician_id?: string | null
          title: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          amount?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          completed_date?: string | null
          completion_summary?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          description?: string | null
          dispatch_notes?: string | null
          id?: string
          job_type?: string | null
          lead_id?: string
          notes?: string | null
          scheduled_at?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          technician_id?: string | null
          title?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          is_public: boolean
          job_id: string
          lead_id: string | null
          public_caption: string | null
          public_url: string | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          job_id: string
          lead_id?: string | null
          public_caption?: string | null
          public_url?: string | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          job_id?: string
          lead_id?: string | null
          public_caption?: string | null
          public_url?: string | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          assigned_to: string | null
          city: string | null
          created_at: string
          email: string | null
          fbclid: string | null
          gclid: string | null
          id: string
          name: string
          notes: string | null
          landing_url: string | null
          phone: string | null
          referrer: string | null
          service: string | null
          source: Database["public"]["Enums"]["lead_source"]
          source_page: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          urgency: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          fbclid?: string | null
          gclid?: string | null
          id?: string
          name: string
          notes?: string | null
          landing_url?: string | null
          phone?: string | null
          referrer?: string | null
          service?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          source_page?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          urgency?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          fbclid?: string | null
          gclid?: string | null
          id?: string
          name?: string
          notes?: string | null
          landing_url?: string | null
          phone?: string | null
          referrer?: string | null
          service?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          source_page?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          urgency?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
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
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      technicians: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      crm_notifications: {
        Row: {
          created_at: string
          follow_up_id: string | null
          id: string
          invoice_id: string | null
          job_id: string | null
          lead_id: string | null
          message: string | null
          read_at: string | null
          technician_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          follow_up_id?: string | null
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          lead_id?: string | null
          message?: string | null
          read_at?: string | null
          technician_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          follow_up_id?: string | null
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          lead_id?: string | null
          message?: string | null
          read_at?: string | null
          technician_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_notifications_follow_up_id_fkey"
            columns: ["follow_up_id"]
            isOneToOne: false
            referencedRelation: "follow_ups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notifications_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notifications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notifications_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      invoice_status: "draft" | "sent" | "paid" | "overdue"
      job_status:
        | "quoted"
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
      lead_source:
        | "contact_form"
        | "rebate_estimator"
        | "phone"
        | "referral"
        | "google"
        | "other"
      lead_status: "new" | "contacted" | "qualified" | "quoted" | "won" | "lost"
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
      app_role: ["admin", "user"],
      invoice_status: ["draft", "sent", "paid", "overdue"],
      job_status: [
        "quoted",
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
      ],
      lead_source: [
        "contact_form",
        "rebate_estimator",
        "phone",
        "referral",
        "google",
        "other",
      ],
      lead_status: ["new", "contacted", "qualified", "quoted", "won", "lost"],
    },
  },
} as const
