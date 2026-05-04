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
      branches: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      file_views: {
        Row: {
          action: string
          created_at: string
          id: string
          pdf_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          pdf_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          pdf_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_views_pdf_id_fkey"
            columns: ["pdf_id"]
            isOneToOne: false
            referencedRelation: "pdf_files"
            referencedColumns: ["id"]
          },
        ]
      }
      formulas: {
        Row: {
          created_at: string
          description: string | null
          download_count: number
          file_size: number | null
          id: string
          mime_type: string
          semester: number | null
          storage_path: string
          subject_id: string | null
          tags: string[]
          title: string
          unit_id: string | null
          updated_at: string
          uploaded_by: string | null
          view_count: number
          year: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_count?: number
          file_size?: number | null
          id?: string
          mime_type?: string
          semester?: number | null
          storage_path: string
          subject_id?: string | null
          tags?: string[]
          title: string
          unit_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number
          year?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          download_count?: number
          file_size?: number | null
          id?: string
          mime_type?: string
          semester?: number | null
          storage_path?: string
          subject_id?: string | null
          tags?: string[]
          title?: string
          unit_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number
          year?: number | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          created_at: string
          description: string | null
          download_count: number
          file_size: number | null
          id: string
          mime_type: string
          semester: number | null
          storage_path: string
          subject_id: string | null
          tags: string[]
          title: string
          unit_id: string | null
          updated_at: string
          uploaded_by: string | null
          view_count: number
          year: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_count?: number
          file_size?: number | null
          id?: string
          mime_type?: string
          semester?: number | null
          storage_path: string
          subject_id?: string | null
          tags?: string[]
          title: string
          unit_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number
          year?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          download_count?: number
          file_size?: number | null
          id?: string
          mime_type?: string
          semester?: number | null
          storage_path?: string
          subject_id?: string | null
          tags?: string[]
          title?: string
          unit_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number
          year?: number | null
        }
        Relationships: []
      }
      papers: {
        Row: {
          created_at: string
          description: string | null
          download_count: number
          exam_year: number | null
          file_size: number | null
          id: string
          mime_type: string
          semester: number | null
          storage_path: string
          subject_id: string | null
          tags: string[]
          title: string
          unit_id: string | null
          updated_at: string
          uploaded_by: string | null
          view_count: number
          year: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_count?: number
          exam_year?: number | null
          file_size?: number | null
          id?: string
          mime_type?: string
          semester?: number | null
          storage_path: string
          subject_id?: string | null
          tags?: string[]
          title: string
          unit_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number
          year?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          download_count?: number
          exam_year?: number | null
          file_size?: number | null
          id?: string
          mime_type?: string
          semester?: number | null
          storage_path?: string
          subject_id?: string | null
          tags?: string[]
          title?: string
          unit_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number
          year?: number | null
        }
        Relationships: []
      }
      pdf_files: {
        Row: {
          branch_id: string | null
          created_at: string
          description: string | null
          download_count: number
          file_size: number | null
          id: string
          mime_type: string
          semester: number | null
          storage_path: string
          subject_id: string | null
          tags: string[]
          title: string
          unit_id: string | null
          updated_at: string
          uploaded_by: string | null
          view_count: number
          year: number | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          description?: string | null
          download_count?: number
          file_size?: number | null
          id?: string
          mime_type?: string
          semester?: number | null
          storage_path: string
          subject_id?: string | null
          tags?: string[]
          title: string
          unit_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number
          year?: number | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          description?: string | null
          download_count?: number
          file_size?: number | null
          id?: string
          mime_type?: string
          semester?: number | null
          storage_path?: string
          subject_id?: string | null
          tags?: string[]
          title?: string
          unit_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pdf_files_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdf_files_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdf_files_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          branch_id: string | null
          code: string
          created_at: string
          id: string
          name: string
          regulation: string
          semester: number | null
          sort_order: number
          updated_at: string
          year: number
        }
        Insert: {
          branch_id?: string | null
          code: string
          created_at?: string
          id?: string
          name: string
          regulation?: string
          semester?: number | null
          sort_order?: number
          updated_at?: string
          year: number
        }
        Update: {
          branch_id?: string | null
          code?: string
          created_at?: string
          id?: string
          name?: string
          regulation?: string
          semester?: number | null
          sort_order?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "subjects_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          id: string
          subject_id: string
          title: string
          topics: string[]
          unit_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          subject_id: string
          title: string
          topics?: string[]
          unit_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          subject_id?: string
          title?: string
          topics?: string[]
          unit_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
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
      videos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          semester: number | null
          subject_id: string | null
          tags: string[]
          thumbnail_url: string | null
          title: string
          unit_id: string | null
          updated_at: string
          uploaded_by: string | null
          url: string
          view_count: number
          year: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          semester?: number | null
          subject_id?: string | null
          tags?: string[]
          thumbnail_url?: string | null
          title: string
          unit_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          url: string
          view_count?: number
          year?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          semester?: number | null
          subject_id?: string | null
          tags?: string[]
          thumbnail_url?: string | null
          title?: string
          unit_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          url?: string
          view_count?: number
          year?: number | null
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
      app_role: "admin" | "editor" | "student"
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
      app_role: ["admin", "editor", "student"],
    },
  },
} as const
