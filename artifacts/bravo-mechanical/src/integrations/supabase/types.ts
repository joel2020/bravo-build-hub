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
      activity_logs: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          channel: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          direction: string | null
          id: string
          job_id: string | null
          lead_id: string | null
          record_id: string
          record_type: string
          title: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          channel?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          direction?: string | null
          id?: string
          job_id?: string | null
          lead_id?: string | null
          record_id: string
          record_type: string
          title: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          channel?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          direction?: string | null
          id?: string
          job_id?: string | null
          lead_id?: string | null
          record_id?: string
          record_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          customer_id: string
          email: string | null
          first_name: string
          id: string
          is_primary: boolean | null
          last_name: string | null
          notes: string | null
          phone: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          email?: string | null
          first_name: string
          id?: string
          is_primary?: boolean | null
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          email?: string | null
          first_name?: string
          id?: string
          is_primary?: boolean | null
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_notifications: {
        Row: {
          created_at: string
          id: string
          job_id: string | null
          lead_id: string | null
          message: string | null
          read: boolean
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id?: string | null
          lead_id?: string | null
          message?: string | null
          read?: boolean
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string | null
          lead_id?: string | null
          message?: string | null
          read?: boolean
          title?: string
          type?: string
        }
        Relationships: [
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
        ]
      }
      customers: {
        Row: {
          address: string | null
          assigned_to: string | null
          balance_due: number | null
          billing_address: string | null
          billing_city: string | null
          billing_same_as_service: boolean | null
          billing_state: string | null
          billing_zip: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          created_from_lead_id: string | null
          customer_type: Database["public"]["Enums"]["customer_type"]
          email: string | null
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          name: string | null
          notes: string | null
          primary_phone: string | null
          secondary_phone: string | null
          service_address: string | null
          service_city: string | null
          service_state: string | null
          service_zip: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          balance_due?: number | null
          billing_address?: string | null
          billing_city?: string | null
          billing_same_as_service?: boolean | null
          billing_state?: string | null
          billing_zip?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          created_from_lead_id?: string | null
          customer_type?: Database["public"]["Enums"]["customer_type"]
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          name?: string | null
          notes?: string | null
          primary_phone?: string | null
          secondary_phone?: string | null
          service_address?: string | null
          service_city?: string | null
          service_state?: string | null
          service_zip?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          balance_due?: number | null
          billing_address?: string | null
          billing_city?: string | null
          billing_same_as_service?: boolean | null
          billing_state?: string | null
          billing_zip?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          created_from_lead_id?: string | null
          customer_type?: Database["public"]["Enums"]["customer_type"]
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          name?: string | null
          notes?: string | null
          primary_phone?: string | null
          secondary_phone?: string | null
          service_address?: string | null
          service_city?: string | null
          service_state?: string | null
          service_zip?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_created_from_lead_id_fkey"
            columns: ["created_from_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          brand: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          equipment_type: string | null
          id: string
          installation_date: string | null
          is_active: boolean | null
          last_service_date: string | null
          model_number: string | null
          name: string
          next_service_date: string | null
          notes: string | null
          serial_number: string | null
          updated_at: string
          warranty_expiration: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          equipment_type?: string | null
          id?: string
          installation_date?: string | null
          is_active?: boolean | null
          last_service_date?: string | null
          model_number?: string | null
          name: string
          next_service_date?: string | null
          notes?: string | null
          serial_number?: string | null
          updated_at?: string
          warranty_expiration?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          equipment_type?: string | null
          id?: string
          installation_date?: string | null
          is_active?: boolean | null
          last_service_date?: string | null
          model_number?: string | null
          name?: string
          next_service_date?: string | null
          notes?: string | null
          serial_number?: string | null
          updated_at?: string
          warranty_expiration?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_line_items: {
        Row: {
          created_at: string
          description: string
          estimate_id: string
          id: string
          item_type: string | null
          quantity: number | null
          sort_order: number | null
          total: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          estimate_id: string
          id?: string
          item_type?: string | null
          quantity?: number | null
          sort_order?: number | null
          total?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          estimate_id?: string
          id?: string
          item_type?: string | null
          quantity?: number | null
          sort_order?: number | null
          total?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_line_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          approved_at: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          customer_notes: string | null
          customer_signature_url: string | null
          decline_reason: string | null
          declined_at: string | null
          discount_amount: number | null
          estimate_number: string
          expiration_date: string | null
          id: string
          internal_notes: string | null
          job_id: string | null
          lead_id: string | null
          scope_of_work: string | null
          sent_at: string | null
          service_address: string | null
          service_city: string | null
          service_state: string | null
          service_zip: string | null
          signed_at: string | null
          status: Database["public"]["Enums"]["estimate_status"]
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          terms_and_conditions: string | null
          total: number | null
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          customer_notes?: string | null
          customer_signature_url?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          discount_amount?: number | null
          estimate_number: string
          expiration_date?: string | null
          id?: string
          internal_notes?: string | null
          job_id?: string | null
          lead_id?: string | null
          scope_of_work?: string | null
          sent_at?: string | null
          service_address?: string | null
          service_city?: string | null
          service_state?: string | null
          service_zip?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["estimate_status"]
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          terms_and_conditions?: string | null
          total?: number | null
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          customer_notes?: string | null
          customer_signature_url?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          discount_amount?: number | null
          estimate_number?: string
          expiration_date?: string | null
          id?: string
          internal_notes?: string | null
          job_id?: string | null
          lead_id?: string | null
          scope_of_work?: string | null
          sent_at?: string | null
          service_address?: string | null
          service_city?: string | null
          service_state?: string | null
          service_zip?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["estimate_status"]
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          terms_and_conditions?: string | null
          total?: number | null
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          record_id: string
          record_type: string
          storage_path: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          record_id: string
          record_type: string
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          record_id?: string
          record_type?: string
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          job_id: string | null
          lead_id: string | null
          note: string | null
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          job_id?: string | null
          lead_id?: string | null
          note?: string | null
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          job_id?: string | null
          lead_id?: string | null
          note?: string | null
          updated_at?: string
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
      invoice_line_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          item_type: string | null
          quantity: number | null
          sort_order: number | null
          total: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          item_type?: string | null
          quantity?: number | null
          sort_order?: number | null
          total?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          item_type?: string | null
          quantity?: number | null
          sort_order?: number | null
          total?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number | null
          balance_due: number | null
          created_at: string
          created_by: string | null
          customer_id: string
          customer_notes: string | null
          discount_amount: number | null
          due_date: string | null
          estimate_id: string | null
          id: string
          internal_notes: string | null
          invoice_number: string
          issue_date: string | null
          job_id: string | null
          line_items: Json
          paid_at: string | null
          payment_method: string | null
          payment_terms: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          total: number | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          balance_due?: number | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          customer_notes?: string | null
          discount_amount?: number | null
          due_date?: string | null
          estimate_id?: string | null
          id?: string
          internal_notes?: string | null
          invoice_number: string
          issue_date?: string | null
          job_id?: string | null
          line_items?: Json
          paid_at?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          balance_due?: number | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          customer_notes?: string | null
          discount_amount?: number | null
          due_date?: string | null
          estimate_id?: string | null
          id?: string
          internal_notes?: string | null
          invoice_number?: string
          issue_date?: string | null
          job_id?: string | null
          line_items?: Json
          paid_at?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_notes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          job_id: string
          note: string
          note_type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          job_id: string
          note: string
          note_type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          job_id?: string
          note?: string
          note_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_notes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          job_id: string
          photo_type: string | null
          photo_url: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          job_id: string
          photo_type?: string | null
          photo_url: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          job_id?: string
          photo_type?: string | null
          photo_url?: string
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
            foreignKeyName: "job_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          actual_end_at: string | null
          actual_start_at: string | null
          address: string | null
          amount: number | null
          assigned_technician_id: string | null
          completed_at: string | null
          completion_notes: string | null
          completion_summary: string | null
          created_at: string
          created_by: string | null
          customer_approval: boolean | null
          customer_email: string | null
          customer_id: string
          customer_name: string | null
          customer_notes: string | null
          customer_phone: string | null
          customer_signature_url: string | null
          description: string | null
          dispatch_notes: string | null
          estimate_id: string | null
          estimated_duration_hours: number | null
          id: string
          internal_notes: string | null
          job_number: string
          job_type: Database["public"]["Enums"]["job_type"]
          lead_id: string | null
          notes: string | null
          parts_needed: string | null
          priority: Database["public"]["Enums"]["job_priority"]
          scheduled_at: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          scope_of_work: string | null
          service_address: string | null
          service_city: string | null
          service_state: string | null
          service_zip: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["job_status"]
          technician_id: string | null
          technician_signature_url: string | null
          title: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          actual_end_at?: string | null
          actual_start_at?: string | null
          address?: string | null
          amount?: number | null
          assigned_technician_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          completion_summary?: string | null
          created_at?: string
          created_by?: string | null
          customer_approval?: boolean | null
          customer_email?: string | null
          customer_id: string
          customer_name?: string | null
          customer_notes?: string | null
          customer_phone?: string | null
          customer_signature_url?: string | null
          description?: string | null
          dispatch_notes?: string | null
          estimate_id?: string | null
          estimated_duration_hours?: number | null
          id?: string
          internal_notes?: string | null
          job_number: string
          job_type?: Database["public"]["Enums"]["job_type"]
          lead_id?: string | null
          notes?: string | null
          parts_needed?: string | null
          priority?: Database["public"]["Enums"]["job_priority"]
          scheduled_at?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          scope_of_work?: string | null
          service_address?: string | null
          service_city?: string | null
          service_state?: string | null
          service_zip?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          technician_id?: string | null
          technician_signature_url?: string | null
          title: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          actual_end_at?: string | null
          actual_start_at?: string | null
          address?: string | null
          amount?: number | null
          assigned_technician_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          completion_summary?: string | null
          created_at?: string
          created_by?: string | null
          customer_approval?: boolean | null
          customer_email?: string | null
          customer_id?: string
          customer_name?: string | null
          customer_notes?: string | null
          customer_phone?: string | null
          customer_signature_url?: string | null
          description?: string | null
          dispatch_notes?: string | null
          estimate_id?: string | null
          estimated_duration_hours?: number | null
          id?: string
          internal_notes?: string | null
          job_number?: string
          job_type?: Database["public"]["Enums"]["job_type"]
          lead_id?: string | null
          notes?: string | null
          parts_needed?: string | null
          priority?: Database["public"]["Enums"]["job_priority"]
          scheduled_at?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          scope_of_work?: string | null
          service_address?: string | null
          service_city?: string | null
          service_state?: string | null
          service_zip?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          technician_id?: string | null
          technician_signature_url?: string | null
          title?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_jobs_estimate"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_assigned_technician_id_fkey"
            columns: ["assigned_technician_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_lead_id_fkey"
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
          billing_address: string | null
          billing_city: string | null
          billing_state: string | null
          billing_zip: string | null
          city: string | null
          company_name: string | null
          consent_to_contact: boolean | null
          converted_at: string | null
          converted_to_customer_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          message: string | null
          name: string | null
          notes: string | null
          phone: string | null
          preferred_date: string | null
          preferred_time: string | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          service_address: string | null
          service_city: string | null
          service_state: string | null
          service_type: Database["public"]["Enums"]["service_type"] | null
          service_zip: string | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"] | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_state?: string | null
          billing_zip?: string | null
          city?: string | null
          company_name?: string | null
          consent_to_contact?: boolean | null
          converted_at?: string | null
          converted_to_customer_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          message?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          service_address?: string | null
          service_city?: string | null
          service_state?: string | null
          service_type?: Database["public"]["Enums"]["service_type"] | null
          service_zip?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_state?: string | null
          billing_zip?: string | null
          city?: string | null
          company_name?: string | null
          consent_to_contact?: boolean | null
          converted_at?: string | null
          converted_to_customer_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          message?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          service_address?: string | null
          service_city?: string | null
          service_state?: string | null
          service_type?: Database["public"]["Enums"]["service_type"] | null
          service_zip?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_leads_customer"
            columns: ["converted_to_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          notification_type: string | null
          read_at: string | null
          record_id: string | null
          record_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          notification_type?: string | null
          read_at?: string | null
          record_id?: string | null
          record_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          notification_type?: string | null
          read_at?: string | null
          record_id?: string | null
          record_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          quickbooks_payment_id: string | null
          reference_number: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          quickbooks_payment_id?: string | null
          reference_number?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          quickbooks_payment_id?: string | null
          reference_number?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      service_agreements: {
        Row: {
          agreement_number: string | null
          agreement_type: string
          billing_cycle: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          end_date: string | null
          id: string
          included_services: string | null
          notes: string | null
          price: number | null
          renewal_date: string | null
          start_date: string
          status: Database["public"]["Enums"]["agreement_status"]
          updated_at: string
          visit_frequency: string | null
        }
        Insert: {
          agreement_number?: string | null
          agreement_type: string
          billing_cycle?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          end_date?: string | null
          id?: string
          included_services?: string | null
          notes?: string | null
          price?: number | null
          renewal_date?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["agreement_status"]
          updated_at?: string
          visit_frequency?: string | null
        }
        Update: {
          agreement_number?: string | null
          agreement_type?: string
          billing_cycle?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          end_date?: string | null
          id?: string
          included_services?: string | null
          notes?: string | null
          price?: number | null
          renewal_date?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["agreement_status"]
          updated_at?: string
          visit_frequency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_agreements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_agreements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json | null
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          due_date: string | null
          id: string
          invoice_id: string | null
          job_id: string | null
          lead_id: string | null
          notes: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          lead_id?: string | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          lead_id?: string | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          specialty: string | null
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
          specialty?: string | null
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
          specialty?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          full_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          notes: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          technician_color: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          technician_color?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          technician_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      activity_log: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"] | null
          channel: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          description: string | null
          direction: string | null
          id: string | null
          job_id: string | null
          lead_id: string | null
          record_id: string | null
          record_type: string | null
          title: string | null
        }
        Insert: {
          activity_type?: Database["public"]["Enums"]["activity_type"] | null
          channel?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          direction?: string | null
          id?: string | null
          job_id?: string | null
          lead_id?: string | null
          record_id?: string | null
          record_type?: string | null
          title?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"] | null
          channel?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          direction?: string | null
          id?: string | null
          job_id?: string | null
          lead_id?: string | null
          record_id?: string | null
          record_type?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auth_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      activity_type:
        | "note"
        | "call"
        | "email"
        | "sms"
        | "visit"
        | "status_change"
        | "estimate_sent"
        | "estimate_approved"
        | "estimate_declined"
        | "invoice_sent"
        | "invoice_paid"
        | "job_created"
        | "job_completed"
        | "lead_created"
        | "customer_created"
        | "task_created"
        | "file_uploaded"
        | "appointment_scheduled"
        | "appointment_confirmed"
        | "follow_up"
      agreement_status: "active" | "expiring_soon" | "expired" | "cancelled"
      customer_type:
        | "residential"
        | "commercial"
        | "property_manager"
        | "contractor"
      estimate_status:
        | "draft"
        | "sent"
        | "viewed"
        | "approved"
        | "declined"
        | "expired"
        | "converted_to_job"
      invoice_status:
        | "draft"
        | "sent"
        | "paid"
        | "partially_paid"
        | "overdue"
        | "cancelled"
      job_priority: "low" | "normal" | "high" | "emergency"
      job_status:
        | "new_request"
        | "scheduled"
        | "technician_assigned"
        | "en_route"
        | "in_progress"
        | "waiting_on_parts"
        | "completed"
        | "needs_follow_up"
        | "cancelled"
      job_type:
        | "hvac_service"
        | "hvac_installation"
        | "plumbing"
        | "mechanical_repair"
        | "preventive_maintenance"
        | "emergency_service"
        | "commercial_service"
        | "residential_service"
        | "inspection"
        | "other"
      lead_source:
        | "website"
        | "google"
        | "referral"
        | "phone_call"
        | "email"
        | "facebook"
        | "existing_customer"
        | "partner"
        | "other"
      lead_status:
        | "new"
        | "contacted"
        | "appointment_scheduled"
        | "estimate_needed"
        | "estimate_sent"
        | "follow_up_needed"
        | "won"
        | "lost"
        | "not_qualified"
      payment_method:
        | "cash"
        | "check"
        | "credit_card"
        | "ach"
        | "zelle"
        | "venmo"
        | "other"
      property_type: "residential" | "commercial"
      service_type:
        | "hvac_service"
        | "hvac_installation"
        | "plumbing"
        | "mechanical_repair"
        | "preventive_maintenance"
        | "emergency_service"
        | "commercial_service"
        | "residential_service"
        | "inspection"
        | "other"
      task_priority: "low" | "normal" | "high" | "urgent"
      task_status: "open" | "in_progress" | "completed" | "overdue"
      urgency_level: "low" | "medium" | "high" | "emergency"
      user_role:
        | "admin"
        | "office_manager"
        | "dispatcher"
        | "sales_estimator"
        | "technician"
        | "viewer"
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
      activity_type: [
        "note",
        "call",
        "email",
        "sms",
        "visit",
        "status_change",
        "estimate_sent",
        "estimate_approved",
        "estimate_declined",
        "invoice_sent",
        "invoice_paid",
        "job_created",
        "job_completed",
        "lead_created",
        "customer_created",
        "task_created",
        "file_uploaded",
        "appointment_scheduled",
        "appointment_confirmed",
        "follow_up",
      ],
      agreement_status: ["active", "expiring_soon", "expired", "cancelled"],
      customer_type: [
        "residential",
        "commercial",
        "property_manager",
        "contractor",
      ],
      estimate_status: [
        "draft",
        "sent",
        "viewed",
        "approved",
        "declined",
        "expired",
        "converted_to_job",
      ],
      invoice_status: [
        "draft",
        "sent",
        "paid",
        "partially_paid",
        "overdue",
        "cancelled",
      ],
      job_priority: ["low", "normal", "high", "emergency"],
      job_status: [
        "new_request",
        "scheduled",
        "technician_assigned",
        "en_route",
        "in_progress",
        "waiting_on_parts",
        "completed",
        "needs_follow_up",
        "cancelled",
      ],
      job_type: [
        "hvac_service",
        "hvac_installation",
        "plumbing",
        "mechanical_repair",
        "preventive_maintenance",
        "emergency_service",
        "commercial_service",
        "residential_service",
        "inspection",
        "other",
      ],
      lead_source: [
        "website",
        "google",
        "referral",
        "phone_call",
        "email",
        "facebook",
        "existing_customer",
        "partner",
        "other",
      ],
      lead_status: [
        "new",
        "contacted",
        "appointment_scheduled",
        "estimate_needed",
        "estimate_sent",
        "follow_up_needed",
        "won",
        "lost",
        "not_qualified",
      ],
      payment_method: [
        "cash",
        "check",
        "credit_card",
        "ach",
        "zelle",
        "venmo",
        "other",
      ],
      property_type: ["residential", "commercial"],
      service_type: [
        "hvac_service",
        "hvac_installation",
        "plumbing",
        "mechanical_repair",
        "preventive_maintenance",
        "emergency_service",
        "commercial_service",
        "residential_service",
        "inspection",
        "other",
      ],
      task_priority: ["low", "normal", "high", "urgent"],
      task_status: ["open", "in_progress", "completed", "overdue"],
      urgency_level: ["low", "medium", "high", "emergency"],
      user_role: [
        "admin",
        "office_manager",
        "dispatcher",
        "sales_estimator",
        "technician",
        "viewer",
      ],
    },
  },
} as const
