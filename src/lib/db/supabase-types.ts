// Auto-generated from the live Supabase schema. Refresh via
// the gsgecrow22 MCP: generate_typescript_types.
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
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          id: string
          kind: string
          message: string | null
          payload: Json | null
          severity: Database["public"]["Enums"]["alert_severity"]
          target_id: string | null
          target_type: string | null
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          kind: string
          message?: string | null
          payload?: Json | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          target_id?: string | null
          target_type?: string | null
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          kind?: string
          message?: string | null
          payload?: Json | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          target_id?: string | null
          target_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          actor_role: string | null
          created_at: string
          id: string
          ip: string | null
          payload: Json | null
          reason: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          payload?: Json | null
          reason?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          payload?: Json | null
          reason?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      disputes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          opened_by: string | null
          opener_role: string
          reason: string
          refund_amount: number | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          sla_due_at: string | null
          state: Database["public"]["Enums"]["dispute_state"]
          transaction_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          opened_by?: string | null
          opener_role: string
          reason: string
          refund_amount?: number | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          sla_due_at?: string | null
          state?: Database["public"]["Enums"]["dispute_state"]
          transaction_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          opened_by?: string | null
          opener_role?: string
          reason?: string
          refund_amount?: number | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          sla_due_at?: string | null
          state?: Database["public"]["Enums"]["dispute_state"]
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_files: {
        Row: {
          caption: string | null
          created_at: string
          dispute_id: string
          id: string
          mime: string | null
          sha256: string | null
          size_bytes: number | null
          storage_path: string
          uploader_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          dispute_id: string
          id?: string
          mime?: string | null
          sha256?: string | null
          size_bytes?: number | null
          storage_path: string
          uploader_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          dispute_id?: string
          id?: string
          mime?: string | null
          sha256?: string | null
          size_bytes?: number | null
          storage_path?: string
          uploader_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_files_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_files_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_submissions: {
        Row: {
          created_at: string
          doc_back_path: string | null
          doc_front_path: string | null
          doc_number: string | null
          doc_type: Database["public"]["Enums"]["kyc_doc_type"]
          id: string
          legal_name: string
          notes: string | null
          profile_id: string
          reviewed_at: string | null
          reviewer_id: string | null
          selfie_path: string | null
          state: Database["public"]["Enums"]["kyc_status"]
        }
        Insert: {
          created_at?: string
          doc_back_path?: string | null
          doc_front_path?: string | null
          doc_number?: string | null
          doc_type: Database["public"]["Enums"]["kyc_doc_type"]
          id?: string
          legal_name: string
          notes?: string | null
          profile_id: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          selfie_path?: string | null
          state?: Database["public"]["Enums"]["kyc_status"]
        }
        Update: {
          created_at?: string
          doc_back_path?: string | null
          doc_front_path?: string | null
          doc_number?: string | null
          doc_type?: Database["public"]["Enums"]["kyc_doc_type"]
          id?: string
          legal_name?: string
          notes?: string | null
          profile_id?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          selfie_path?: string | null
          state?: Database["public"]["Enums"]["kyc_status"]
        }
        Relationships: [
          {
            foreignKeyName: "kyc_submissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_submissions_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          category: Database["public"]["Enums"]["listing_category"]
          city: string | null
          created_at: string
          delivery_available: boolean
          delivery_fee: number
          description: string
          featured: boolean
          id: string
          images: Json
          kind: Database["public"]["Enums"]["listing_kind"]
          metadata: Json | null
          price: number
          published_at: string | null
          purchases: number
          saves: number
          seller_id: string
          slug: string
          state: Database["public"]["Enums"]["listing_state"]
          stock: number | null
          suspended_reason: string | null
          tagline: string | null
          tags: Json | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          category?: Database["public"]["Enums"]["listing_category"]
          city?: string | null
          created_at?: string
          delivery_available?: boolean
          delivery_fee?: number
          description: string
          featured?: boolean
          id?: string
          images?: Json
          kind?: Database["public"]["Enums"]["listing_kind"]
          metadata?: Json | null
          price: number
          published_at?: string | null
          purchases?: number
          saves?: number
          seller_id: string
          slug: string
          state?: Database["public"]["Enums"]["listing_state"]
          stock?: number | null
          suspended_reason?: string | null
          tagline?: string | null
          tags?: Json | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["listing_category"]
          city?: string | null
          created_at?: string
          delivery_available?: boolean
          delivery_fee?: number
          description?: string
          featured?: boolean
          id?: string
          images?: Json
          kind?: Database["public"]["Enums"]["listing_kind"]
          metadata?: Json | null
          price?: number
          published_at?: string | null
          purchases?: number
          saves?: number
          seller_id?: string
          slug?: string
          state?: Database["public"]["Enums"]["listing_state"]
          stock?: number | null
          suspended_reason?: string | null
          tagline?: string | null
          tags?: Json | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          authorization_url: string | null
          channel: string | null
          created_at: string
          currency: string
          id: string
          psp: string
          psp_access_code: string | null
          psp_reference: string | null
          raw: Json | null
          state: Database["public"]["Enums"]["payment_state"]
          transaction_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          authorization_url?: string | null
          channel?: string | null
          created_at?: string
          currency?: string
          id?: string
          psp?: string
          psp_access_code?: string | null
          psp_reference?: string | null
          raw?: Json | null
          state?: Database["public"]["Enums"]["payment_state"]
          transaction_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          authorization_url?: string | null
          channel?: string | null
          created_at?: string
          currency?: string
          id?: string
          psp?: string
          psp_access_code?: string | null
          psp_reference?: string | null
          raw?: Json | null
          state?: Database["public"]["Enums"]["payment_state"]
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          failure_reason: string | null
          id: string
          kind: Database["public"]["Enums"]["payout_kind"]
          paid_at: string | null
          payee_id: string | null
          payee_momo_network: string | null
          payee_name: string
          payee_phone: string
          psp: string
          psp_transfer_ref: string | null
          raw: Json | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          risk_flags: Json | null
          state: Database["public"]["Enums"]["payout_state"]
          transaction_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          failure_reason?: string | null
          id?: string
          kind: Database["public"]["Enums"]["payout_kind"]
          paid_at?: string | null
          payee_id?: string | null
          payee_momo_network?: string | null
          payee_name: string
          payee_phone: string
          psp?: string
          psp_transfer_ref?: string | null
          raw?: Json | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          risk_flags?: Json | null
          state?: Database["public"]["Enums"]["payout_state"]
          transaction_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          failure_reason?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["payout_kind"]
          paid_at?: string | null
          payee_id?: string | null
          payee_momo_network?: string | null
          payee_name?: string
          payee_phone?: string
          psp?: string
          psp_transfer_ref?: string | null
          raw?: Json | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          risk_flags?: Json | null
          state?: Database["public"]["Enums"]["payout_state"]
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_payee_id_fkey"
            columns: ["payee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badge_enabled: boolean
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          handle: string | null
          id: string
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          location: string | null
          momo_network: string | null
          momo_number: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          suspended: boolean
          trust_score: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          badge_enabled?: boolean
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          handle?: string | null
          id: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          location?: string | null
          momo_network?: string | null
          momo_number?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          suspended?: boolean
          trust_score?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          badge_enabled?: boolean
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          handle?: string | null
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          location?: string | null
          momo_network?: string | null
          momo_number?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          suspended?: boolean
          trust_score?: number
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_public: boolean
          reviewee_id: string | null
          reviewee_name: string
          reviewer_id: string | null
          stars: number
          transaction_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          reviewee_id?: string | null
          reviewee_name: string
          reviewer_id?: string | null
          stars: number
          transaction_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          reviewee_id?: string | null
          reviewee_name?: string
          reviewer_id?: string | null
          stars?: number
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      riders: {
        Row: {
          available: boolean
          completed_deliveries: number
          created_at: string
          id: string
          profile_id: string
          rating: number
          service_area: string
          vehicle: string | null
        }
        Insert: {
          available?: boolean
          completed_deliveries?: number
          created_at?: string
          id?: string
          profile_id: string
          rating?: number
          service_area: string
          vehicle?: string | null
        }
        Update: {
          available?: boolean
          completed_deliveries?: number
          created_at?: string
          id?: string
          profile_id?: string
          rating?: number
          service_area?: string
          vehicle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "riders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_log: {
        Row: {
          body: string
          created_at: string
          error: string | null
          id: string
          kind: string | null
          provider: string
          provider_message_id: string | null
          recipient: string
          ref: string | null
          retries: number
          sender_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["sms_status"]
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          body: string
          created_at?: string
          error?: string | null
          id?: string
          kind?: string | null
          provider: string
          provider_message_id?: string | null
          recipient: string
          ref?: string | null
          retries?: number
          sender_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["sms_status"]
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          error?: string | null
          id?: string
          kind?: string | null
          provider?: string
          provider_message_id?: string | null
          recipient?: string
          ref?: string | null
          retries?: number
          sender_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["sms_status"]
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      transaction_events: {
        Row: {
          actor_id: string | null
          actor_role: string | null
          created_at: string
          from_state: Database["public"]["Enums"]["txn_state"] | null
          id: string
          note: string | null
          to_state: Database["public"]["Enums"]["txn_state"]
          transaction_id: string
        }
        Insert: {
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          from_state?: Database["public"]["Enums"]["txn_state"] | null
          id?: string
          note?: string | null
          to_state: Database["public"]["Enums"]["txn_state"]
          transaction_id: string
        }
        Update: {
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          from_state?: Database["public"]["Enums"]["txn_state"] | null
          id?: string
          note?: string | null
          to_state?: Database["public"]["Enums"]["txn_state"]
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_events_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          auto_release_at: string | null
          buyer_fee: number
          buyer_id: string | null
          buyer_name: string
          buyer_phone: string
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          delivered_at: string | null
          delivery_address: string
          delivery_amount: number
          delivery_city: string
          delivery_code_hash: string | null
          delivery_code_shown: boolean
          dispatched_at: string | null
          id: string
          initiated_by: string
          item_description: string
          item_link: string | null
          metadata: Json | null
          paid_at: string | null
          product_amount: number
          psp_fee: number
          ref: string
          released_at: string | null
          rider_id: string | null
          rider_payout_amount: number
          rider_release_fee: number
          seller_fee: number
          seller_id: string | null
          seller_name: string
          seller_payout_amount: number
          seller_phone: string
          state: Database["public"]["Enums"]["txn_state"]
          total_charged: number
          updated_at: string
        }
        Insert: {
          auto_release_at?: string | null
          buyer_fee?: number
          buyer_id?: string | null
          buyer_name: string
          buyer_phone: string
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_address: string
          delivery_amount?: number
          delivery_city: string
          delivery_code_hash?: string | null
          delivery_code_shown?: boolean
          dispatched_at?: string | null
          id?: string
          initiated_by: string
          item_description: string
          item_link?: string | null
          metadata?: Json | null
          paid_at?: string | null
          product_amount: number
          psp_fee?: number
          ref: string
          released_at?: string | null
          rider_id?: string | null
          rider_payout_amount?: number
          rider_release_fee?: number
          seller_fee?: number
          seller_id?: string | null
          seller_name: string
          seller_payout_amount: number
          seller_phone: string
          state?: Database["public"]["Enums"]["txn_state"]
          total_charged: number
          updated_at?: string
        }
        Update: {
          auto_release_at?: string | null
          buyer_fee?: number
          buyer_id?: string | null
          buyer_name?: string
          buyer_phone?: string
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_address?: string
          delivery_amount?: number
          delivery_city?: string
          delivery_code_hash?: string | null
          delivery_code_shown?: boolean
          dispatched_at?: string | null
          id?: string
          initiated_by?: string
          item_description?: string
          item_link?: string | null
          metadata?: Json | null
          paid_at?: string | null
          product_amount?: number
          psp_fee?: number
          ref?: string
          released_at?: string | null
          rider_id?: string | null
          rider_payout_amount?: number
          rider_release_fee?: number
          seller_fee?: number
          seller_id?: string | null
          seller_name?: string
          seller_payout_amount?: number
          seller_phone?: string
          state?: Database["public"]["Enums"]["txn_state"]
          total_charged?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks_log: {
        Row: {
          created_at: string
          error: string | null
          event: string | null
          id: string
          idempotency_key: string | null
          processed_at: string | null
          provider: string
          raw: Json | null
          signature_ok: boolean
        }
        Insert: {
          created_at?: string
          error?: string | null
          event?: string | null
          id?: string
          idempotency_key?: string | null
          processed_at?: string | null
          provider: string
          raw?: Json | null
          signature_ok: boolean
        }
        Update: {
          created_at?: string
          error?: string | null
          event?: string | null
          id?: string
          idempotency_key?: string | null
          processed_at?: string | null
          provider?: string
          raw?: Json | null
          signature_ok?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      alert_severity: "info" | "warning" | "critical"
      dispute_state:
        | "open"
        | "in_review"
        | "resolved_buyer"
        | "resolved_seller"
        | "partial"
        | "withdrawn"
      kyc_doc_type:
        | "ghana_card"
        | "passport"
        | "drivers_license"
        | "voter_id"
        | "selfie"
        | "business_cert"
      kyc_status: "none" | "pending" | "approved" | "rejected"
      listing_category:
        | "fashion"
        | "beauty"
        | "hair"
        | "electronics"
        | "food"
        | "home"
        | "services"
        | "automotive"
        | "sneakers"
        | "art"
        | "other"
      listing_kind: "product" | "service"
      listing_state:
        | "draft"
        | "pending_review"
        | "published"
        | "suspended"
        | "archived"
      payment_state:
        | "initialized"
        | "pending"
        | "succeeded"
        | "failed"
        | "refunded"
        | "partially_refunded"
      payout_kind: "seller" | "rider"
      payout_state:
        | "pending_approval"
        | "approved"
        | "rejected"
        | "processing"
        | "paid"
        | "failed"
      sms_status: "queued" | "sent" | "failed" | "delivered" | "undelivered"
      txn_state:
        | "created"
        | "awaiting_payment"
        | "paid"
        | "dispatched"
        | "delivered"
        | "released"
        | "disputed"
        | "refund_issued"
        | "partial_refund"
        | "payout_pending"
        | "payout_approved"
        | "payout_failed"
        | "completed"
        | "cancelled"
      user_role:
        | "buyer"
        | "seller"
        | "rider"
        | "admin"
        | "superadmin"
        | "approver"
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
      alert_severity: ["info", "warning", "critical"],
      dispute_state: [
        "open",
        "in_review",
        "resolved_buyer",
        "resolved_seller",
        "partial",
        "withdrawn",
      ],
      kyc_doc_type: [
        "ghana_card",
        "passport",
        "drivers_license",
        "voter_id",
        "selfie",
        "business_cert",
      ],
      kyc_status: ["none", "pending", "approved", "rejected"],
      listing_category: [
        "fashion",
        "beauty",
        "hair",
        "electronics",
        "food",
        "home",
        "services",
        "automotive",
        "sneakers",
        "art",
        "other",
      ],
      listing_kind: ["product", "service"],
      listing_state: [
        "draft",
        "pending_review",
        "published",
        "suspended",
        "archived",
      ],
      payment_state: [
        "initialized",
        "pending",
        "succeeded",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      payout_kind: ["seller", "rider"],
      payout_state: [
        "pending_approval",
        "approved",
        "rejected",
        "processing",
        "paid",
        "failed",
      ],
      sms_status: ["queued", "sent", "failed", "delivered", "undelivered"],
      txn_state: [
        "created",
        "awaiting_payment",
        "paid",
        "dispatched",
        "delivered",
        "released",
        "disputed",
        "refund_issued",
        "partial_refund",
        "payout_pending",
        "payout_approved",
        "payout_failed",
        "completed",
        "cancelled",
      ],
      user_role: [
        "buyer",
        "seller",
        "rider",
        "admin",
        "superadmin",
        "approver",
      ],
    },
  },
} as const
