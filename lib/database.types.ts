export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          role: string | null
          avatar: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          role?: string | null
          avatar?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          role?: string | null
          avatar?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      mentors: {
        Row: {
          id: string
          title: string | null
          university: string | null
          bio: string | null
          rating: number | null
          review_count: number | null
          languages: string[] | null
          created_at: string | null
          stripe_connect_account_id: string | null
          calendly_username: string | null
          updated_at: string
        }
        Insert: {
          id: string
          title?: string | null
          university?: string | null
          bio?: string | null
          rating?: number | null
          review_count?: number | null
          languages?: string[] | null
          created_at?: string | null
          stripe_connect_account_id?: string | null
          calendly_username?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          university?: string | null
          bio?: string | null
          rating?: number | null
          review_count?: number | null
          languages?: string[] | null
          created_at?: string | null
          stripe_connect_account_id?: string | null
          calendly_username?: string | null
          updated_at?: string
        }
      }
      specialties: {
        Row: {
          id: string
          mentor_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          name?: string
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          mentor_id: string
          title: string
          organization: string
          years: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          title: string
          organization: string
          years: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          title?: string
          organization?: string
          years?: string
          description?: string | null
          created_at?: string
        }
      }
      awards: {
        Row: {
          id: string
          mentor_id: string
          title: string
          issuer: string
          year: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          title: string
          issuer: string
          year: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          title?: string
          issuer?: string
          year?: string
          description?: string | null
          created_at?: string
        }
      }
      essays: {
        Row: {
          id: string
          mentor_id: string
          title: string
          prompt: string
          text: string
          university: string
          created_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          title: string
          prompt: string
          text: string
          university: string
          created_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          title?: string
          prompt?: string
          text?: string
          university?: string
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          mentor_id: string
          name: string
          description: string | null
          price: number
          duration: number
          stripe_product_id: string | null
          stripe_price_id: string | null
          calendly_url: string | null
          created_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          name: string
          description?: string | null
          price: number
          duration: number
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          calendly_url?: string | null
          created_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          name?: string
          description?: string | null
          price?: number
          duration?: number
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          calendly_url?: string | null
          created_at?: string | null
          updated_at?: string
        }
      }
      availability: {
        Row: {
          id: string
          mentor_id: string
          day: string
          slots: string[]
          created_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          day: string
          slots: string[]
          created_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          day?: string
          slots?: string[]
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          mentor_id: string
          rating: number
          comment: string | null
          client_id: string | null
          name: string
          service: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mentor_id: string
          rating: number
          comment?: string | null
          client_id?: string | null
          name: string
          service: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mentor_id?: string
          rating?: number
          comment?: string | null
          client_id?: string | null
          name?: string
          service?: string
          text?: string
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          mentor_id: string
          service_id: string
          status: string
          date: string
          created_at: string
          client_id: string
          time: string
          payment_intent_id: string | null
          stripe_transfer_id: string | null
          calendly_event_uri: string | null
          calendly_event_id: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mentor_id: string
          service_id: string
          status: string
          date: string
          created_at?: string
          client_id: string
          time: string
          payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          calendly_event_uri?: string | null
          calendly_event_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mentor_id?: string
          service_id?: string
          status?: string
          date?: string
          created_at?: string
          client_id?: string
          time?: string
          payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          calendly_event_uri?: string | null
          calendly_event_id?: string | null
          updated_at?: string
        }
      }
      stripe_connect_accounts: {
        Row: {
          id: string
          user_id: string
          stripe_account_id: string
          charges_enabled: boolean
          payouts_enabled: boolean
          details_submitted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_account_id: string
          charges_enabled?: boolean
          payouts_enabled?: boolean
          details_submitted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_account_id?: string
          charges_enabled?: boolean
          payouts_enabled?: boolean
          details_submitted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          review_id: string
          featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          featured: boolean
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          featured?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
