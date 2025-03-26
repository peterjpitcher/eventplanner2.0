export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string
          created_at: string
          customer_id: string
          event_id: string
          seats_or_reminder: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          customer_id: string
          event_id: string
          seats_or_reminder: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          customer_id?: string
          event_id?: string
          seats_or_reminder?: string
          notes?: string | null
        }
      }
      customers: {
        Row: {
          id: string
          created_at: string
          first_name: string
          last_name: string | null
          mobile_number: string
          email: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          first_name: string
          last_name?: string | null
          mobile_number: string
          email?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          first_name?: string
          last_name?: string | null
          mobile_number?: string
          email?: string | null
        }
      }
      events: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          date: string
          time: string
          location: string | null
          category_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          date: string
          time: string
          location?: string | null
          category_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          date?: string
          time?: string
          location?: string | null
          category_id?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
        }
      }
      sms_messages: {
        Row: {
          id: string
          created_at: string
          booking_id: string
          message_type: string
          message: string
          status: string
          error: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          booking_id: string
          message_type: string
          message: string
          status: string
          error?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          booking_id?: string
          message_type?: string
          message?: string
          status?: string
          error?: string | null
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