export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'doctor' | 'patient'
          full_name: string | null
          phone: string | null
          center_id: number | null
          created_at: string
        }
        Insert: {
          id: string
          role: 'admin' | 'doctor' | 'patient'
          full_name?: string | null
          phone?: string | null
          center_id?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'doctor' | 'patient'
          full_name?: string | null
          phone?: string | null
          center_id?: number | null
          created_at?: string
        }
      }
      centers: {
        Row: {
          id: number
          name: string
          address: string | null
          contact_email: string | null
        }
        Insert: {
          id?: number
          name: string
          address?: string | null
          contact_email?: string | null
        }
        Update: {
          id?: number
          name?: string
          address?: string | null
          contact_email?: string | null
        }
      }
      therapies: {
        Row: {
          id: number
          name: string
          duration_days: number | null
          description: string | null
        }
        Insert: {
          id?: number
          name: string
          duration_days?: number | null
          description?: string | null
        }
        Update: {
          id?: number
          name?: string
          duration_days?: number | null
          description?: string | null
        }
      }
      therapy_sessions: {
        Row: {
          id: number
          patient_id: string
          doctor_id: string | null
          therapy_id: number | null
          scheduled_start: string
          scheduled_end: string
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          patient_id: string
          doctor_id?: string | null
          therapy_id?: number | null
          scheduled_start: string
          scheduled_end: string
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          patient_id?: string
          doctor_id?: string | null
          therapy_id?: number | null
          scheduled_start?: string
          scheduled_end?: string
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
        }
      }
      feedbacks: {
        Row: {
          id: number
          session_id: number
          patient_id: string | null
          rating: number | null
          symptoms: string | null
          improvement_notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          session_id: number
          patient_id?: string | null
          rating?: number | null
          symptoms?: string | null
          improvement_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          session_id?: number
          patient_id?: string | null
          rating?: number | null
          symptoms?: string | null
          improvement_notes?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: number
          user_id: string | null
          channel: 'inapp' | 'email'
          title: string | null
          message: string | null
          is_read: boolean | null
          send_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          channel?: 'inapp' | 'email'
          title?: string | null
          message?: string | null
          is_read?: boolean | null
          send_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          channel?: 'inapp' | 'email'
          title?: string | null
          message?: string | null
          is_read?: boolean | null
          send_at?: string
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
