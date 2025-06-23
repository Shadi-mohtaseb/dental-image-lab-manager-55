export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      company_capital: {
        Row: {
          id: string
          total_capital: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          total_capital?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          total_capital?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      doctor_transactions: {
        Row: {
          amount: number
          created_at: string
          doctor_id: string
          id: string
          notes: string | null
          payment_method: string | null
          status: string | null
          transaction_date: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          doctor_id: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          status?: string | null
          transaction_date: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          status?: string | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
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
          work_type_id: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          price?: number
          updated_at?: string
          work_type_id: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          price?: number
          updated_at?: string
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
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          created_at: string
          description: string
          id: string
          item_name: string
          notes: string | null
          purchase_date: string
          quantity: number
          total_amount: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          item_name: string
          notes?: string | null
          purchase_date: string
          quantity?: number
          total_amount: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          item_name?: string
          notes?: string | null
          purchase_date?: string
          quantity?: number
          total_amount?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
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
        }
        Relationships: []
      }
      work_types: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_company_capital: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      distribute_profits_to_partners: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
