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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      cases: {
        Row: {
          created_at: string
          delivery_date: string | null
          doctor_id: string | null
          id: string
          notes: string | null
          patient_age: number | null
          patient_name: string
          patient_phone: string | null
          price: number | null
          shade: string | null
          status: string | null
          submission_date: string
          teeth_count: number | null
          tooth_number: string | null
          updated_at: string
          user_id: string | null
          work_type: string
          zircon_block_type: string | null
        }
        Insert: {
          created_at?: string
          delivery_date?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_age?: number | null
          patient_name: string
          patient_phone?: string | null
          price?: number | null
          shade?: string | null
          status?: string | null
          submission_date?: string
          teeth_count?: number | null
          tooth_number?: string | null
          updated_at?: string
          user_id?: string | null
          work_type: string
          zircon_block_type?: string | null
        }
        Update: {
          created_at?: string
          delivery_date?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_age?: number | null
          patient_name?: string
          patient_phone?: string | null
          price?: number | null
          shade?: string | null
          status?: string | null
          submission_date?: string
          teeth_count?: number | null
          tooth_number?: string | null
          updated_at?: string
          user_id?: string | null
          work_type?: string
          zircon_block_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      checks: {
        Row: {
          amount: number
          back_image_url: string | null
          bank_name: string | null
          check_date: string
          check_number: string | null
          created_at: string
          doctor_id: string | null
          front_image_url: string | null
          id: string
          notes: string | null
          receive_date: string | null
          recipient_name: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          back_image_url?: string | null
          bank_name?: string | null
          check_date: string
          check_number?: string | null
          created_at?: string
          doctor_id?: string | null
          front_image_url?: string | null
          id?: string
          notes?: string | null
          receive_date?: string | null
          recipient_name?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          back_image_url?: string | null
          bank_name?: string | null
          check_date?: string
          check_number?: string | null
          created_at?: string
          doctor_id?: string | null
          front_image_url?: string | null
          id?: string
          notes?: string | null
          receive_date?: string | null
          recipient_name?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checks_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      company_capital: {
        Row: {
          id: string
          total_capital: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          total_capital?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          total_capital?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      doctor_transactions: {
        Row: {
          amount: number
          check_cash_date: string | null
          created_at: string
          doctor_id: string
          id: string
          notes: string | null
          payment_method: string | null
          status: string | null
          transaction_date: string
          transaction_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          check_cash_date?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          status?: string | null
          transaction_date: string
          transaction_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          check_cash_date?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          status?: string | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_transactions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_work_type_prices: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          price: number
          updated_at: string
          user_id: string | null
          work_type_id: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          price?: number
          updated_at?: string
          user_id?: string | null
          work_type_id: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          price?: number
          updated_at?: string
          user_id?: string | null
          work_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_work_type_prices_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_work_type_prices_work_type_id_fkey"
            columns: ["work_type_id"]
            isOneToOne: false
            referencedRelation: "work_types"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      expense_types: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          created_at: string
          expense_type_id: string
          id: string
          notes: string | null
          purchase_date: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expense_type_id: string
          id?: string
          notes?: string | null
          purchase_date: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expense_type_id?: string
          id?: string
          notes?: string | null
          purchase_date?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_expense_type_id_fkey"
            columns: ["expense_type_id"]
            isOneToOne: false
            referencedRelation: "expense_types"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          partner_id: string
          transaction_date: string
          transaction_source: string | null
          transaction_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          partner_id: string
          transaction_date: string
          transaction_source?: string | null
          transaction_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          partner_id?: string
          transaction_date?: string
          transaction_source?: string | null
          transaction_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_transactions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          partnership_percentage: number | null
          personal_balance: number | null
          phone: string | null
          total_amount: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          partnership_percentage?: number | null
          personal_balance?: number | null
          phone?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          partnership_percentage?: number | null
          personal_balance?: number | null
          phone?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_permanent: boolean
          notes: string | null
          start_date: string
          status: string
          subscription_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_permanent?: boolean
          notes?: string | null
          start_date?: string
          status?: string
          subscription_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_permanent?: boolean
          notes?: string | null
          start_date?: string
          status?: string
          subscription_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_types: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_company_capital: { Args: never; Returns: number }
      distribute_profits_to_partners: { Args: never; Returns: undefined }
      generate_doctor_access_token: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_subscription_active: { Args: { _user_id: string }; Returns: boolean }
      update_company_capital: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
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
    },
  },
} as const
