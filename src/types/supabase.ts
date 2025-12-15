export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            categories: {
                Row: {
                    color: string
                    created_at: string | null
                    id: number
                    name: string
                    type: string
                    user_id: string
                }
                Insert: {
                    color: string
                    created_at?: string | null
                    id?: number
                    name: string
                    type: string
                    user_id: string
                }
                Update: {
                    color?: string
                    created_at?: string | null
                    id?: number
                    name?: string
                    type?: string
                    user_id?: string
                }
                Relationships: []
            }
            investments: {
                Row: {
                    category: string
                    created_at: string | null
                    current_amount: number
                    id: number
                    initial_amount: number
                    name: string
                    start_date: string
                    status: string
                    target_return: number
                    user_id: string
                }
                Insert: {
                    category: string
                    created_at?: string | null
                    current_amount: number
                    id?: number
                    initial_amount: number
                    name: string
                    start_date: string
                    status: string
                    target_return: number
                    user_id: string
                }
                Update: {
                    category?: string
                    created_at?: string | null
                    current_amount?: number
                    id?: number
                    initial_amount?: number
                    name?: string
                    start_date?: string
                    status?: string
                    target_return?: number
                    user_id?: string
                }
                Relationships: []
            }
            loans: {
                Row: {
                    amount: number
                    created_at: string | null
                    due_date: string
                    entity: string
                    id: number
                    interest_rate: number
                    start_date: string
                    status: string
                    type: string
                    user_id: string
                }
                Insert: {
                    amount: number
                    created_at?: string | null
                    due_date: string
                    entity: string
                    id?: number
                    interest_rate: number
                    start_date: string
                    status: string
                    type: string
                    user_id: string
                }
                Update: {
                    amount?: number
                    created_at?: string | null
                    due_date?: string
                    entity?: string
                    id?: number
                    interest_rate?: number
                    start_date?: string
                    status?: string
                    type?: string
                    user_id?: string
                }
                Relationships: []
            }
            recurring_transactions: {
                Row: {
                    active: boolean | null
                    amount: number
                    category: string
                    created_at: string | null
                    day_of_month: number
                    description: string
                    id: number
                    last_generated: string | null
                    type: string
                    user_id: string
                }
                Insert: {
                    active?: boolean | null
                    amount: number
                    category: string
                    created_at?: string | null
                    day_of_month: number
                    description: string
                    id?: number
                    last_generated?: string | null
                    type: string
                    user_id: string
                }
                Update: {
                    active?: boolean | null
                    amount?: number
                    category?: string
                    created_at?: string | null
                    day_of_month?: number
                    description?: string
                    id?: number
                    last_generated?: string | null
                    type?: string
                    user_id?: string
                }
                Relationships: []
            }
            transactions: {
                Row: {
                    amount: number
                    category: string
                    created_at: string | null
                    date: string
                    description: string
                    id: number
                    status: string
                    type: string
                    user_id: string
                }
                Insert: {
                    amount: number
                    category: string
                    created_at?: string | null
                    date: string
                    description: string
                    id?: number
                    status: string
                    type: string
                    user_id: string
                }
                Update: {
                    amount?: number
                    category?: string
                    created_at?: string | null
                    date?: string
                    description?: string
                    id?: number
                    status?: string
                    type?: string
                    user_id?: string
                }
                Relationships: []
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
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
