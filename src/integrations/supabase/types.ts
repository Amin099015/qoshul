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
      event_participants: {
        Row: {
          created_at: string
          event_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          age_limit: string
          approval: boolean
          base_participants: number
          capacity: number
          category: string
          city: string
          created_at: string
          created_by: string | null
          description: string
          format: string
          host_name: string
          id: string
          image: string
          is_sample: boolean
          language: string
          lat: number
          level: string
          lng: number
          location: string
          partner: boolean
          price: number
          recurring: string
          start_time: string
          starts_on: string
          tags: string[]
          title: string
        }
        Insert: {
          age_limit?: string
          approval?: boolean
          base_participants?: number
          capacity?: number
          category: string
          city: string
          created_at?: string
          created_by?: string | null
          description?: string
          format?: string
          host_name?: string
          id?: string
          image?: string
          is_sample?: boolean
          language?: string
          lat: number
          level?: string
          lng: number
          location: string
          partner?: boolean
          price?: number
          recurring?: string
          start_time?: string
          starts_on?: string
          tags?: string[]
          title: string
        }
        Update: {
          age_limit?: string
          approval?: boolean
          base_participants?: number
          capacity?: number
          category?: string
          city?: string
          created_at?: string
          created_by?: string | null
          description?: string
          format?: string
          host_name?: string
          id?: string
          image?: string
          is_sample?: boolean
          language?: string
          lat?: number
          level?: string
          lng?: number
          location?: string
          partner?: boolean
          price?: number
          recurring?: string
          start_time?: string
          starts_on?: string
          tags?: string[]
          title?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee: string
          created_at: string
          id: string
          requester: string
          status: string
        }
        Insert: {
          addressee: string
          created_at?: string
          id?: string
          requester: string
          status?: string
        }
        Update: {
          addressee?: string
          created_at?: string
          id?: string
          requester?: string
          status?: string
        }
        Relationships: []
      }
      match_cache: {
        Row: {
          people: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          people?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          people?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          event_id: string | null
          friendship_id: string | null
          id: string
          sender_name: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          event_id?: string | null
          friendship_id?: string | null
          id?: string
          sender_name?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          event_id?: string | null
          friendship_id?: string | null
          id?: string
          sender_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_friendship_id_fkey"
            columns: ["friendship_id"]
            isOneToOne: false
            referencedRelation: "friendships"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability: string[]
          avatar_url: string | null
          birth_date: string | null
          budget: string | null
          city: string
          company: string | null
          course: string | null
          created_at: string
          degree: string | null
          faculty: string | null
          first_name: string
          gender: string | null
          goals: string[]
          group_size: string | null
          id: string
          interests: string[]
          languages: Json
          last_name: string
          moderation: string
          onboarded: boolean
          open_answers: Json
          personality: Json | null
          personality_answers: Json
          school_grade: string | null
          school_name: string | null
          status: string | null
          university: string | null
          updated_at: string
          visibility: Json
          work_field: string | null
          work_position: string | null
          work_schedule: string | null
          xp: number
        }
        Insert: {
          availability?: string[]
          avatar_url?: string | null
          birth_date?: string | null
          budget?: string | null
          city?: string
          company?: string | null
          course?: string | null
          created_at?: string
          degree?: string | null
          faculty?: string | null
          first_name?: string
          gender?: string | null
          goals?: string[]
          group_size?: string | null
          id: string
          interests?: string[]
          languages?: Json
          last_name?: string
          moderation?: string
          onboarded?: boolean
          open_answers?: Json
          personality?: Json | null
          personality_answers?: Json
          school_grade?: string | null
          school_name?: string | null
          status?: string | null
          university?: string | null
          updated_at?: string
          visibility?: Json
          work_field?: string | null
          work_position?: string | null
          work_schedule?: string | null
          xp?: number
        }
        Update: {
          availability?: string[]
          avatar_url?: string | null
          birth_date?: string | null
          budget?: string | null
          city?: string
          company?: string | null
          course?: string | null
          created_at?: string
          degree?: string | null
          faculty?: string | null
          first_name?: string
          gender?: string | null
          goals?: string[]
          group_size?: string | null
          id?: string
          interests?: string[]
          languages?: Json
          last_name?: string
          moderation?: string
          onboarded?: boolean
          open_answers?: Json
          personality?: Json | null
          personality_answers?: Json
          school_grade?: string | null
          school_name?: string | null
          status?: string | null
          university?: string | null
          updated_at?: string
          visibility?: Json
          work_field?: string | null
          work_position?: string | null
          work_schedule?: string | null
          xp?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string
          created_at: string
          event_id: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string
          created_at?: string
          event_id: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          event_id?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_events: {
        Row: {
          event_id: string
          user_id: string
        }
        Insert: {
          event_id: string
          user_id: string
        }
        Update: {
          event_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_xp: { Args: { _amount: number; _user: string }; Returns: undefined }
      can_access_chat: {
        Args: { _event: string; _friendship: string }
        Returns: boolean
      }
      event_counts: {
        Args: never
        Returns: {
          event_id: string
          joined: number
        }[]
      }
      match_candidates: { Args: never; Returns: string[] }
      public_profile_cards: {
        Args: { _ids?: string[] }
        Returns: {
          avatar_url: string
          city: string
          faculty: string
          first_name: string
          goals: string[]
          id: string
          interests: string[]
          is_minor: boolean
          languages: Json
          last_name: string
          personality_summary: string
          personality_type: string
          school_name: string
          status: string
          university: string
          work_field: string
        }[]
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
    Enums: {},
  },
} as const
