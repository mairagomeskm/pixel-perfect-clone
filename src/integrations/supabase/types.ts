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
      campaigns: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          goal: number
          id: string
          pet_id: string | null
          photo_url: string | null
          pix_key: string
          pix_name: string
          raised: number
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          goal?: number
          id?: string
          pet_id?: string | null
          photo_url?: string | null
          pix_key?: string
          pix_name?: string
          raised?: number
          title: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          goal?: number
          id?: string
          pet_id?: string | null
          photo_url?: string | null
          pix_key?: string
          pix_name?: string
          raised?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          adopter_id: string
          created_at: string
          id: string
          kind: string
          last_message_at: string
          pet_id: string | null
          pinned_message_id: string | null
          protector_id: string | null
          title: string | null
        }
        Insert: {
          adopter_id: string
          created_at?: string
          id?: string
          kind?: string
          last_message_at?: string
          pet_id?: string | null
          pinned_message_id?: string | null
          protector_id?: string | null
          title?: string | null
        }
        Update: {
          adopter_id?: string
          created_at?: string
          id?: string
          kind?: string
          last_message_at?: string
          pet_id?: string | null
          pinned_message_id?: string | null
          protector_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      diary_posts: {
        Row: {
          author_id: string
          caption: string | null
          created_at: string
          id: string
          media_type: string
          media_url: string
          pet_id: string
        }
        Insert: {
          author_id: string
          caption?: string | null
          created_at?: string
          id?: string
          media_type?: string
          media_url: string
          pet_id: string
        }
        Update: {
          author_id?: string
          caption?: string | null
          created_at?: string
          id?: string
          media_type?: string
          media_url?: string
          pet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diary_posts_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_path: string | null
          attachment_type: string | null
          body: string | null
          conversation_id: string
          created_at: string
          id: string
          is_bot: boolean
          read_at: string | null
          sender_id: string | null
        }
        Insert: {
          attachment_path?: string | null
          attachment_type?: string | null
          body?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          is_bot?: boolean
          read_at?: string | null
          sender_id?: string | null
        }
        Update: {
          attachment_path?: string | null
          attachment_type?: string | null
          body?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          is_bot?: boolean
          read_at?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      missing_pets: {
        Row: {
          contact: string | null
          created_at: string
          description: string | null
          id: string
          location: string
          name: string
          photo_url: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location: string
          name: string
          photo_url?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string
          name?: string
          photo_url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          document: string | null
          id: string
          kind: Database["public"]["Enums"]["profile_type"]
          name: string
          phone: string | null
          region: string | null
          social_link: string | null
        }
        Insert: {
          created_at?: string
          document?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["profile_type"]
          name: string
          phone?: string | null
          region?: string | null
          social_link?: string | null
        }
        Update: {
          created_at?: string
          document?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["profile_type"]
          name?: string
          phone?: string | null
          region?: string | null
          social_link?: string | null
        }
        Relationships: []
      }
      pets: {
        Row: {
          age_label: string
          created_at: string
          description: string | null
          id: string
          is_puppy: boolean
          name: string
          organization_id: string | null
          owner_id: string | null
          photo_url: string | null
          region: string
          species: string
          status: string
        }
        Insert: {
          age_label?: string
          created_at?: string
          description?: string | null
          id?: string
          is_puppy?: boolean
          name: string
          organization_id?: string | null
          owner_id?: string | null
          photo_url?: string | null
          region?: string
          species?: string
          status?: string
        }
        Update: {
          age_label?: string
          created_at?: string
          description?: string | null
          id?: string
          is_puppy?: boolean
          name?: string
          organization_id?: string | null
          owner_id?: string | null
          photo_url?: string | null
          region?: string
          species?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          census: Json
          cep: string | null
          cnpj: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          profile_type: Database["public"]["Enums"]["profile_type"]
          proof_path: string | null
          social_link: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          census?: Json
          cep?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          profile_type?: Database["public"]["Enums"]["profile_type"]
          proof_path?: string | null
          social_link?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          census?: Json
          cep?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          profile_type?: Database["public"]["Enums"]["profile_type"]
          proof_path?: string | null
          social_link?: string | null
          updated_at?: string
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
      is_conversation_member: {
        Args: { _conv: string; _user: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      profile_type: "adotante" | "ong" | "protetor"
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
      app_role: ["admin", "moderator", "user"],
      profile_type: ["adotante", "ong", "protetor"],
    },
  },
} as const
