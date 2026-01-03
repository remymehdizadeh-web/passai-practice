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
      ai_tutor_cache: {
        Row: {
          created_at: string
          id: string
          query_hash: string
          question_id: string
          response: string
        }
        Insert: {
          created_at?: string
          id?: string
          query_hash: string
          question_id: string
          response: string
        }
        Update: {
          created_at?: string
          id?: string
          query_hash?: string
          question_id?: string
          response?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_cache_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tutor_usage: {
        Row: {
          created_at: string
          id: string
          request_count: number
          session_id: string
          usage_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_count?: number
          session_id: string
          usage_date?: string
        }
        Update: {
          created_at?: string
          id?: string
          request_count?: number
          session_id?: string
          usage_date?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          question_id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          question_id: string
          report_type: string
          session_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          question_id: string
          report_type: string
          session_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          question_id?: string
          report_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_reports_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          exam_date: string | null
          id: string
          last_study_date: string | null
          streak_days: number | null
          study_goal_daily: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          exam_date?: string | null
          id: string
          last_study_date?: string | null
          streak_days?: number | null
          study_goal_daily?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          exam_date?: string | null
          id?: string
          last_study_date?: string | null
          streak_days?: number | null
          study_goal_daily?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          category: string
          correct_label: string
          created_at: string
          difficulty: string
          exam_type: string
          id: string
          is_active: boolean
          nclex_category: string
          options: Json
          rationale_bullets: string[]
          stem: string
          study_tags: string[] | null
          takeaway: string
          wrong_option_bullets: Json | null
        }
        Insert: {
          category: string
          correct_label: string
          created_at?: string
          difficulty?: string
          exam_type?: string
          id?: string
          is_active?: boolean
          nclex_category: string
          options: Json
          rationale_bullets?: string[]
          stem: string
          study_tags?: string[] | null
          takeaway: string
          wrong_option_bullets?: Json | null
        }
        Update: {
          category?: string
          correct_label?: string
          created_at?: string
          difficulty?: string
          exam_type?: string
          id?: string
          is_active?: boolean
          nclex_category?: string
          options?: Json
          rationale_bullets?: string[]
          stem?: string
          study_tags?: string[] | null
          takeaway?: string
          wrong_option_bullets?: Json | null
        }
        Relationships: []
      }
      review_queue: {
        Row: {
          created_at: string
          due_at: string
          ease_factor: number
          id: string
          interval_days: number
          question_id: string
          reason: string
          review_count: number
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          question_id: string
          reason: string
          review_count?: number
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          question_id?: string
          reason?: string
          review_count?: number
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_queue_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_events: {
        Row: {
          created_at: string
          currency: string | null
          environment: string | null
          event_id: string | null
          event_type: string
          expiration_at: string | null
          id: string
          is_trial: boolean | null
          original_purchase_date: string | null
          price: number | null
          product_id: string | null
          raw_payload: Json | null
          store: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          environment?: string | null
          event_id?: string | null
          event_type: string
          expiration_at?: string | null
          id?: string
          is_trial?: boolean | null
          original_purchase_date?: string | null
          price?: number | null
          product_id?: string | null
          raw_payload?: Json | null
          store?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          environment?: string | null
          event_id?: string | null
          event_type?: string
          expiration_at?: string | null
          id?: string
          is_trial?: boolean | null
          original_purchase_date?: string | null
          price?: number | null
          product_id?: string | null
          raw_payload?: Json | null
          store?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          confidence: string | null
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          selected_label: string
          session_id: string
        }
        Insert: {
          confidence?: string | null
          created_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          selected_label: string
          session_id: string
        }
        Update: {
          confidence?: string | null
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_label?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
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
      subscription_analytics: {
        Row: {
          cancellations: number | null
          expirations: number | null
          renewals: number | null
          total_purchases: number | null
          total_revenue: number | null
          trial_starts: number | null
          unique_subscribers: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_current_session_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
