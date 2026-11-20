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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      budgets: {
        Row: {
          allocated_amount: number
          category_id: string
          category_type: Database["public"]["Enums"]["transaction_type"]
          created_at: string
          id: string
          owner_id: string
          period_identifier: string
          period_type: Database["public"]["Enums"]["budget_period_type"]
          updated_at: string
        }
        Insert: {
          allocated_amount: number
          category_id: string
          category_type?: Database["public"]["Enums"]["transaction_type"]
          created_at?: string
          id?: string
          owner_id?: string
          period_identifier: string
          period_type: Database["public"]["Enums"]["budget_period_type"]
          updated_at?: string
        }
        Update: {
          allocated_amount?: number
          category_id?: string
          category_type?: Database["public"]["Enums"]["transaction_type"]
          created_at?: string
          id?: string
          owner_id?: string
          period_identifier?: string
          period_type?: Database["public"]["Enums"]["budget_period_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_category_type_fkey"
            columns: ["category_id", "category_type"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "category_type"]
          },
        ]
      }
      categories: {
        Row: {
          category_type: Database["public"]["Enums"]["transaction_type"]
          color: string
          created_at: string
          icon: string | null
          id: string
          is_archived: boolean
          name: string
          owner_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_type: Database["public"]["Enums"]["transaction_type"]
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_archived?: boolean
          name: string
          owner_id?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_type?: Database["public"]["Enums"]["transaction_type"]
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          owner_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      preferences: {
        Row: {
          appearance: Database["public"]["Enums"]["appearance"]
          created_at: string
          currency_display: string
          date_format: string
          id: string
          number_format: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          appearance?: Database["public"]["Enums"]["appearance"]
          created_at?: string
          currency_display?: string
          date_format?: string
          id?: string
          number_format?: string
          owner_id?: string
          updated_at?: string
        }
        Update: {
          appearance?: Database["public"]["Enums"]["appearance"]
          created_at?: string
          currency_display?: string
          date_format?: string
          id?: string
          number_format?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          notifications_seen_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id: string
          notifications_seen_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          notifications_seen_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      recurring_processing_runs: {
        Row: {
          error: string | null
          finished_at: string | null
          id: string
          run_date: string
          schedules_processed: number
          started_at: string
          transactions_created: number
        }
        Insert: {
          error?: string | null
          finished_at?: string | null
          id?: string
          run_date: string
          schedules_processed?: number
          started_at?: string
          transactions_created?: number
        }
        Update: {
          error?: string | null
          finished_at?: string | null
          id?: string
          run_date?: string
          schedules_processed?: number
          started_at?: string
          transactions_created?: number
        }
        Relationships: []
      }
      recurring_schedules: {
        Row: {
          amount: number
          anchor_day_of_month: number | null
          category_id: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          is_subscription: boolean
          next_scheduled_date: string
          notes: string | null
          original_start_date: string
          owner_id: string
          recurrence_interval: Database["public"]["Enums"]["recurrence_interval"]
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          anchor_day_of_month?: number | null
          category_id: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_subscription?: boolean
          next_scheduled_date: string
          notes?: string | null
          original_start_date: string
          owner_id?: string
          recurrence_interval: Database["public"]["Enums"]["recurrence_interval"]
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          anchor_day_of_month?: number | null
          category_id?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_subscription?: boolean
          next_scheduled_date?: string
          notes?: string | null
          original_start_date?: string
          owner_id?: string
          recurrence_interval?: Database["public"]["Enums"]["recurrence_interval"]
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_schedules_category_id_transaction_type_fkey"
            columns: ["category_id", "transaction_type"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "category_type"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          description: string | null
          id: string
          notes: string | null
          owner_id: string
          recurring_schedule_id: string | null
          scheduled_for: string | null
          source: Database["public"]["Enums"]["transaction_source"]
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          recurring_schedule_id?: string | null
          scheduled_for?: string | null
          source?: Database["public"]["Enums"]["transaction_source"]
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          recurring_schedule_id?: string | null
          scheduled_for?: string | null
          source?: Database["public"]["Enums"]["transaction_source"]
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_transaction_type_fkey"
            columns: ["category_id", "transaction_type"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "category_type"]
          },
          {
            foreignKeyName: "transactions_recurring_schedule_id_fkey"
            columns: ["recurring_schedule_id"]
            isOneToOne: false
            referencedRelation: "recurring_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_recurring_schedule: {
        Args: {
          p_amount: number
          p_category_id: string
          p_description: string
          p_icon?: string
          p_interval: Database["public"]["Enums"]["recurrence_interval"]
          p_is_subscription?: boolean
          p_notes: string
          p_record_first?: boolean
          p_start_date: string
          p_today: string
          p_transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Returns: string
      }
      process_recurring_schedules: {
        Args: { p_today: string }
        Returns: {
          schedules_processed: number
          transactions_created: number
        }[]
      }
      restore_backup: { Args: { p_backup: Json }; Returns: Json }
    }
    Enums: {
      appearance: "dark" | "light" | "system"
      budget_period_type: "monthly" | "yearly"
      recurrence_interval: "weekly" | "monthly"
      transaction_source: "manual" | "recurring"
      transaction_type: "income" | "expense"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      appearance: ["dark", "light", "system"],
      budget_period_type: ["monthly", "yearly"],
      recurrence_interval: ["weekly", "monthly"],
      transaction_source: ["manual", "recurring"],
      transaction_type: ["income", "expense"],
    },
  },
} as const
