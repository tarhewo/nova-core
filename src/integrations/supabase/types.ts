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
      admin_allowlist: {
        Row: {
          bonus_cents: number
          created_at: string
          email: string
          note: string | null
          tier: Database["public"]["Enums"]["account_tier"]
        }
        Insert: {
          bonus_cents?: number
          created_at?: string
          email: string
          note?: string | null
          tier?: Database["public"]["Enums"]["account_tier"]
        }
        Update: {
          bonus_cents?: number
          created_at?: string
          email?: string
          note?: string | null
          tier?: Database["public"]["Enums"]["account_tier"]
        }
        Relationships: []
      }
      courses: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration_minutes: number
          enrolled_count: number
          id: string
          instructor: string
          level: string
          rating: number
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          enrolled_count?: number
          id?: string
          instructor: string
          level?: string
          rating?: number
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          enrolled_count?: number
          id?: string
          instructor?: string
          level?: string
          rating?: number
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          course_id: string
          created_at: string
          id: string
          last_watched_at: string
          progress: number
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          last_watched_at?: string
          progress?: number
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          last_watched_at?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      local_listings: {
        Row: {
          active: boolean
          category: string
          city: string | null
          condition: Database["public"]["Enums"]["local_condition"]
          contact_method: string
          country: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          owner_id: string
          price_cents: number
          region: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          city?: string | null
          condition?: Database["public"]["Enums"]["local_condition"]
          contact_method?: string
          country?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          owner_id: string
          price_cents: number
          region?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          city?: string | null
          condition?: Database["public"]["Enums"]["local_condition"]
          contact_method?: string
          country?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          owner_id?: string
          price_cents?: number
          region?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_chats: {
        Row: {
          buyer_id: string
          buyer_unread: number
          created_at: string
          id: string
          last_message_at: string
          last_preview: string | null
          listing_id: string
          listing_kind: Database["public"]["Enums"]["listing_kind"]
          seller_id: string
          seller_unread: number
        }
        Insert: {
          buyer_id: string
          buyer_unread?: number
          created_at?: string
          id?: string
          last_message_at?: string
          last_preview?: string | null
          listing_id: string
          listing_kind: Database["public"]["Enums"]["listing_kind"]
          seller_id: string
          seller_unread?: number
        }
        Update: {
          buyer_id?: string
          buyer_unread?: number
          created_at?: string
          id?: string
          last_message_at?: string
          last_preview?: string | null
          listing_id?: string
          listing_kind?: Database["public"]["Enums"]["listing_kind"]
          seller_id?: string
          seller_unread?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_url: string | null
          body: string | null
          chat_id: string
          created_at: string
          edited_at: string | null
          id: string
          kind: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          body?: string | null
          chat_id: string
          created_at?: string
          edited_at?: string | null
          id?: string
          kind?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          body?: string | null
          chat_id?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          kind?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "marketplace_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_cents: number
          buyer_id: string
          created_at: string
          id: string
          listing_id: string
          listing_kind: Database["public"]["Enums"]["listing_kind"]
          metadata: Json
          seller_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          title: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          buyer_id: string
          created_at?: string
          id?: string
          listing_id: string
          listing_kind: Database["public"]["Enums"]["listing_kind"]
          metadata?: Json
          seller_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          title: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          listing_kind?: Database["public"]["Enums"]["listing_kind"]
          metadata?: Json
          seller_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          brand: string
          created_at: string
          exp_month: number
          exp_year: number
          id: string
          is_default: boolean
          last4: string
          nickname: string | null
          user_id: string
        }
        Insert: {
          brand: string
          created_at?: string
          exp_month: number
          exp_year: number
          id?: string
          is_default?: boolean
          last4: string
          nickname?: string | null
          user_id: string
        }
        Update: {
          brand?: string
          created_at?: string
          exp_month?: number
          exp_year?: number
          id?: string
          is_default?: boolean
          last4?: string
          nickname?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          active: boolean
          created_at: string
          id: string
          params: Json
          rule_type: string
          scope: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          params?: Json
          rule_type: string
          scope?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          params?: Json
          rule_type?: string
          scope?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          featured: boolean
          id: string
          image_url: string | null
          price_cents: number
          rating: number
          stock: number
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          price_cents: number
          rating?: number
          stock?: number
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          price_cents?: number
          rating?: number
          stock?: number
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          tier: Database["public"]["Enums"]["account_tier"]
          updated_at: string
          wallet_balance: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          tier?: Database["public"]["Enums"]["account_tier"]
          updated_at?: string
          wallet_balance?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          tier?: Database["public"]["Enums"]["account_tier"]
          updated_at?: string
          wallet_balance?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          listing_id: string
          listing_kind: Database["public"]["Enums"]["listing_kind"]
          rating: number
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id: string
          listing_kind: Database["public"]["Enums"]["listing_kind"]
          rating: number
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          listing_kind?: Database["public"]["Enums"]["listing_kind"]
          rating?: number
          reviewer_id?: string
        }
        Relationships: []
      }
      service_listings: {
        Row: {
          active: boolean
          base_price_cents: number
          category: string
          cover_url: string | null
          created_at: string
          delivery_days: number
          description: string | null
          id: string
          owner_id: string
          rating: number
          rating_count: number
          shop_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          base_price_cents: number
          category?: string
          cover_url?: string | null
          created_at?: string
          delivery_days?: number
          description?: string | null
          id?: string
          owner_id: string
          rating?: number
          rating_count?: number
          shop_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          base_price_cents?: number
          category?: string
          cover_url?: string | null
          created_at?: string
          delivery_days?: number
          description?: string | null
          id?: string
          owner_id?: string
          rating?: number
          rating_count?: number
          shop_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_listings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      service_packages: {
        Row: {
          created_at: string
          delivery_days: number
          description: string | null
          id: string
          price_cents: number
          revisions: number
          service_id: string
          tier: string
          title: string
        }
        Insert: {
          created_at?: string
          delivery_days?: number
          description?: string | null
          id?: string
          price_cents: number
          revisions?: number
          service_id: string
          tier: string
          title: string
        }
        Update: {
          created_at?: string
          delivery_days?: number
          description?: string | null
          id?: string
          price_cents?: number
          revisions?: number
          service_id?: string
          tier?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number
          status: Database["public"]["Enums"]["service_status"]
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number
          status?: Database["public"]["Enums"]["service_status"]
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["service_status"]
        }
        Relationships: []
      }
      shops: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          rating: number
          rating_count: number
          slug: string
          tagline: string | null
          updated_at: string
          verified: boolean
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          rating?: number
          rating_count?: number
          slug: string
          tagline?: string | null
          updated_at?: string
          verified?: boolean
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          rating?: number
          rating_count?: number
          slug?: string
          tagline?: string | null
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          metadata: Json
          service_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          service_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          service_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_listings: {
        Row: {
          airline: string
          cabin: string
          created_at: string
          departure_at: string
          destination: string
          destination_code: string
          duration_minutes: number
          id: string
          origin: string
          origin_code: string
          price_cents: number
          seats_available: number
        }
        Insert: {
          airline: string
          cabin?: string
          created_at?: string
          departure_at: string
          destination: string
          destination_code: string
          duration_minutes: number
          id?: string
          origin: string
          origin_code: string
          price_cents: number
          seats_available?: number
        }
        Update: {
          airline?: string
          cabin?: string
          created_at?: string
          departure_at?: string
          destination?: string
          destination_code?: string
          duration_minutes?: number
          id?: string
          origin?: string
          origin_code?: string
          price_cents?: number
          seats_available?: number
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          action_type: Database["public"]["Enums"]["activity_type"]
          created_at: string
          id: string
          metadata: Json
          user_id: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          id?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          id?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      marketplace_chat_open: {
        Args: {
          p_listing_id: string
          p_listing_kind: Database["public"]["Enums"]["listing_kind"]
          p_seller_id: string
        }
        Returns: string
      }
      marketplace_purchase: {
        Args: {
          p_amount_cents: number
          p_listing_id: string
          p_listing_kind: Database["public"]["Enums"]["listing_kind"]
          p_meta?: Json
          p_seller_id?: string
          p_title: string
        }
        Returns: string
      }
      messages_mark_read: { Args: { p_chat_id: string }; Returns: number }
      notifications_mark_all_read: { Args: never; Returns: number }
      slugify: { Args: { p: string }; Returns: string }
      wallet_send: {
        Args: { p_amount: number; p_recipient: string }
        Returns: number
      }
      wallet_topup: { Args: { p_amount: number }; Returns: number }
    }
    Enums: {
      account_tier: "standard" | "premium" | "enterprise"
      activity_type: "login" | "purchase" | "booking" | "topup" | "other"
      app_role: "user" | "vendor" | "admin"
      listing_kind: "product" | "service" | "local" | "shop"
      local_condition: "new" | "like_new" | "used" | "for_parts"
      order_status: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded"
      service_category: "fintech" | "travel" | "media" | "shop"
      service_status: "active" | "coming_soon"
      transaction_status: "pending" | "completed" | "failed" | "refunded"
      transaction_type: "payment" | "booking" | "purchase" | "topup" | "refund"
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
      account_tier: ["standard", "premium", "enterprise"],
      activity_type: ["login", "purchase", "booking", "topup", "other"],
      app_role: ["user", "vendor", "admin"],
      listing_kind: ["product", "service", "local", "shop"],
      local_condition: ["new", "like_new", "used", "for_parts"],
      order_status: ["pending", "paid", "fulfilled", "cancelled", "refunded"],
      service_category: ["fintech", "travel", "media", "shop"],
      service_status: ["active", "coming_soon"],
      transaction_status: ["pending", "completed", "failed", "refunded"],
      transaction_type: ["payment", "booking", "purchase", "topup", "refund"],
    },
  },
} as const
