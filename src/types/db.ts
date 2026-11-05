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
      answers: {
        Row: {
          choice: Database["public"]["Enums"]["choice"]
          dilemma_id: number
          id: number
          reason: string
          submission_id: string
        }
        Insert: {
          choice: Database["public"]["Enums"]["choice"]
          dilemma_id: number
          id?: never
          reason: string
          submission_id: string
        }
        Update: {
          choice?: Database["public"]["Enums"]["choice"]
          dilemma_id?: number
          id?: never
          reason?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_dilemma_id_fkey"
            columns: ["dilemma_id"]
            isOneToOne: false
            referencedRelation: "dilemmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      dilemmas: {
        Row: {
          id: number
          is_active: boolean
          option_a: string
          option_a_easy: string
          option_b: string
          option_b_easy: string
          scenario: string
          scenario_easy: string
          sort_order: number
          title: string
          value_label: string
        }
        Insert: {
          id: number
          is_active?: boolean
          option_a: string
          option_a_easy: string
          option_b: string
          option_b_easy: string
          scenario: string
          scenario_easy: string
          sort_order: number
          title: string
          value_label: string
        }
        Update: {
          id?: number
          is_active?: boolean
          option_a?: string
          option_a_easy?: string
          option_b?: string
          option_b_easy?: string
          scenario?: string
          scenario_easy?: string
          sort_order?: number
          title?: string
          value_label?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          created_at: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          target_group: Database["public"]["Enums"]["target_group"]
        }
        Insert: {
          created_at?: string
          gender: Database["public"]["Enums"]["gender"]
          id?: string
          target_group: Database["public"]["Enums"]["target_group"]
        }
        Update: {
          created_at?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          target_group?: Database["public"]["Enums"]["target_group"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_choice_stats: {
        Args: {
          p_gender?: Database["public"]["Enums"]["gender"]
          p_group?: Database["public"]["Enums"]["target_group"]
        }
        Returns: {
          a_count: number
          b_count: number
          dilemma_id: number
        }[]
      }
      get_reasons: {
        Args: {
          p_gender?: Database["public"]["Enums"]["gender"]
          p_group?: Database["public"]["Enums"]["target_group"]
        }
        Returns: {
          choice: Database["public"]["Enums"]["choice"]
          dilemma_id: number
          id: number
          reason: string
        }[]
      }
      submit_survey: {
        Args: {
          p_answers: Json
          p_gender: Database["public"]["Enums"]["gender"]
          p_group: Database["public"]["Enums"]["target_group"]
        }
        Returns: string
      }
    }
    Enums: {
      choice: "A" | "B"
      gender: "male" | "female" | "undisclosed"
      target_group: "elementary" | "middle" | "high" | "adult"
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
      choice: ["A", "B"],
      gender: ["male", "female", "undisclosed"],
      target_group: ["elementary", "middle", "high", "adult"],
    },
  },
} as const
