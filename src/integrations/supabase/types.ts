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
      ai_insights: {
        Row: {
          confidence_score: number | null
          created_at: string
          data: Json | null
          description: string
          expires_at: string | null
          id: string
          insight_type: string
          is_active: boolean | null
          title: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          data?: Json | null
          description: string
          expires_at?: string | null
          id?: string
          insight_type: string
          is_active?: boolean | null
          title: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          data?: Json | null
          description?: string
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_active?: boolean | null
          title?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          annual_revenue: number | null
          city: string | null
          country: string | null
          created_at: string
          created_by: string
          email: string | null
          employee_count: number | null
          id: string
          industry: string | null
          name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string
          updated_by: string | null
          website: string | null
          workspace_id: string
        }
        Insert: {
          address?: string | null
          annual_revenue?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          updated_by?: string | null
          website?: string | null
          workspace_id: string
        }
        Update: {
          address?: string | null
          annual_revenue?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          updated_by?: string | null
          website?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_performance_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_performance_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string
          department: string | null
          email: string | null
          first_name: string
          id: string
          job_title: string | null
          last_contact_date: string | null
          last_name: string
          lead_score: number | null
          lead_source: Database["public"]["Enums"]["lead_source"] | null
          mobile_phone: string | null
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          social_linkedin: string | null
          social_twitter: string | null
          status: Database["public"]["Enums"]["contact_status"]
          updated_at: string
          updated_by: string | null
          workspace_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by: string
          department?: string | null
          email?: string | null
          first_name: string
          id?: string
          job_title?: string | null
          last_contact_date?: string | null
          last_name: string
          lead_score?: number | null
          lead_source?: Database["public"]["Enums"]["lead_source"] | null
          mobile_phone?: string | null
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
          updated_by?: string | null
          workspace_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string
          department?: string | null
          email?: string | null
          first_name?: string
          id?: string
          job_title?: string | null
          last_contact_date?: string | null
          last_name?: string
          lead_score?: number | null
          lead_source?: Database["public"]["Enums"]["lead_source"] | null
          mobile_phone?: string | null
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
          updated_by?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_performance_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_performance_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deal_activities: {
        Row: {
          activity_type: string
          created_at: string
          created_by: string
          deal_id: string
          description: string | null
          id: string
          new_value: string | null
          old_value: string | null
          workspace_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          created_by: string
          deal_id: string
          description?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          workspace_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          created_by?: string
          deal_id?: string
          description?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_deal_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deal_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_performance_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deal_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deal_activities_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          actual_close_date: string | null
          assigned_to: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string
          currency: string | null
          description: string | null
          expected_close_date: string | null
          id: string
          notes: string | null
          probability: number | null
          source: Database["public"]["Enums"]["deal_source"] | null
          stage: Database["public"]["Enums"]["deal_stage"]
          title: string
          updated_at: string
          updated_by: string | null
          value: number
          workspace_id: string
        }
        Insert: {
          actual_close_date?: string | null
          assigned_to?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by: string
          currency?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          probability?: number | null
          source?: Database["public"]["Enums"]["deal_source"] | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          title: string
          updated_at?: string
          updated_by?: string | null
          value?: number
          workspace_id: string
        }
        Update: {
          actual_close_date?: string | null
          assigned_to?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          currency?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          probability?: number | null
          source?: Database["public"]["Enums"]["deal_source"] | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          title?: string
          updated_at?: string
          updated_by?: string | null
          value?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_performance_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_performance_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_performance_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          assigned_to: string | null
          company_id: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          updated_by: string | null
          workspace_id: string
        }
        Insert: {
          assigned_to?: string | null
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
          workspace_id: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_performance_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_performance_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_performance_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      module_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          module_name: string
          new_state: Json | null
          performed_by: string
          previous_state: Json | null
          reason: string | null
          workspace_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          module_name: string
          new_state?: Json | null
          performed_by: string
          previous_state?: Json | null
          reason?: string | null
          workspace_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          module_name?: string
          new_state?: Json | null
          performed_by?: string
          previous_state?: Json | null
          reason?: string | null
          workspace_id?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_core: boolean
          name: string
          required_modules: string[] | null
          settings_schema: Json | null
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_core?: boolean
          name: string
          required_modules?: string[] | null
          settings_schema?: Json | null
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_core?: boolean
          name?: string
          required_modules?: string[] | null
          settings_schema?: Json | null
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
          workflow_step_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id: string
          workflow_step_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
          workflow_step_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_workflow_step_id_fkey"
            columns: ["workflow_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_workflows: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          edges: Json
          id: string
          is_reusable: boolean
          name: string
          nodes: Json
          updated_at: string
          viewport: Json | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          edges?: Json
          id?: string
          is_reusable?: boolean
          name: string
          nodes?: Json
          updated_at?: string
          viewport?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          edges?: Json
          id?: string
          is_reusable?: boolean
          name?: string
          nodes?: Json
          updated_at?: string
          viewport?: Json | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          role_in_team: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_in_team?: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role_in_team?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_performance_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          manager_id: string
          name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id: string
          name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string
          name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_performance_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          created_at: string
          department: string | null
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          used_at: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by: string
          role?: Database["public"]["Enums"]["user_role"]
          used_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["user_role"]
          used_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          id: string
          is_online: boolean
          last_seen: string
          session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_online?: boolean
          last_seen?: string
          session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_online?: boolean
          last_seen?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_comments_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_performance_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_comments_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_definitions: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          edges: Json
          id: string
          is_reusable: boolean
          name: string
          nodes: Json
          updated_at: string
          viewport: Json | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          edges?: Json
          id?: string
          is_reusable?: boolean
          name: string
          nodes?: Json
          updated_at?: string
          viewport?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          edges?: Json
          id?: string
          is_reusable?: boolean
          name?: string
          nodes?: Json
          updated_at?: string
          viewport?: Json | null
        }
        Relationships: []
      }
      workflow_instances: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step_id: string | null
          id: string
          start_data: Json | null
          started_by: string
          status: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step_id?: string | null
          id?: string
          start_data?: Json | null
          started_by: string
          status?: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step_id?: string | null
          id?: string
          start_data?: Json | null
          started_by?: string
          status?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_instances_current_step_id_fkey"
            columns: ["current_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_performance_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_step_assignments: {
        Row: {
          assigned_by: string
          assigned_to: string
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          status: string
          updated_at: string
          workflow_step_id: string
        }
        Insert: {
          assigned_by: string
          assigned_to: string
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          workflow_step_id: string
        }
        Update: {
          assigned_by?: string
          assigned_to?: string
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          workflow_step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_step_assignments_workflow_step_id_fkey"
            columns: ["workflow_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          created_at: string
          dependencies: string[] | null
          description: string | null
          estimated_hours: number | null
          id: string
          metadata: Json | null
          name: string
          status: Database["public"]["Enums"]["task_status"]
          step_order: number
          updated_at: string
          workflow_id: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          metadata?: Json | null
          name: string
          status?: Database["public"]["Enums"]["task_status"]
          step_order: number
          updated_at?: string
          workflow_id: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          metadata?: Json | null
          name?: string
          status?: Database["public"]["Enums"]["task_status"]
          step_order?: number
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_performance_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          template_data: Json
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          template_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      workflows: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          is_reusable: boolean
          metadata: Json | null
          name: string
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["workflow_status"]
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_reusable?: boolean
          metadata?: Json | null
          name: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["workflow_status"]
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_reusable?: boolean
          metadata?: Json | null
          name?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["workflow_status"]
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      workspace_modules: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          created_at: string
          id: string
          is_active: boolean
          module_id: string
          settings: Json | null
          updated_at: string
          version: string | null
          workspace_id: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          module_id: string
          settings?: Json | null
          updated_at?: string
          version?: string | null
          workspace_id: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          module_id?: string
          settings?: Json | null
          updated_at?: string
          version?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_modules_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      department_analytics: {
        Row: {
          avg_time_variance: number | null
          completed_steps: number | null
          department: string | null
          department_completion_rate: number | null
          total_actual_hours: number | null
          total_estimated_hours: number | null
          total_steps: number | null
          total_users: number | null
          workflows_created: number | null
        }
        Relationships: []
      }
      user_performance_analytics: {
        Row: {
          avg_time_variance: number | null
          completion_rate: number | null
          department: string | null
          full_name: string | null
          id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          steps_assigned: number | null
          steps_completed: number | null
          steps_in_progress: number | null
          total_actual_hours: number | null
          total_estimated_hours: number | null
          workflows_assigned: number | null
          workflows_created: number | null
        }
        Relationships: []
      }
      workflow_performance_analytics: {
        Row: {
          assigned_to: string | null
          assigned_to_name: string | null
          completed_steps: number | null
          completion_percentage: number | null
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          id: string | null
          in_progress_steps: number | null
          name: string | null
          pending_steps: number | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          status: Database["public"]["Enums"]["workflow_status"] | null
          total_actual_hours: number | null
          total_duration_hours: number | null
          total_estimated_hours: number | null
          total_steps: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      workflow_trends: {
        Row: {
          avg_completion_time_hours: number | null
          date: string | null
          workflows_active: number | null
          workflows_completed: number | null
          workflows_created: number | null
          workflows_paused: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_access_module_data: {
        Args: { p_user_id: string; p_module_name: string }
        Returns: boolean
      }
      can_access_team_member_data: {
        Args: { user_id: string; target_user_id: string }
        Returns: boolean
      }
      can_user_access_workspace: {
        Args: { user_id: string; target_workspace_id: string }
        Returns: boolean
      }
      check_module_dependencies: {
        Args: { p_workspace_id: string; p_module_name: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_dependency_conflicts: {
        Args: { p_workspace_id: string; p_modules_to_deactivate: string[] }
        Returns: {
          affected_module: string
          display_name: string
          conflict_type: string
          impact_level: number
          suggested_action: string
        }[]
      }
      get_dependent_modules: {
        Args: { p_workspace_id: string; p_module_name: string }
        Returns: {
          module_name: string
          display_name: string
          is_active: boolean
        }[]
      }
      get_module_access_info: {
        Args: { p_workspace_id: string; p_user_id: string }
        Returns: {
          module_name: string
          display_name: string
          is_active: boolean
          is_available: boolean
          has_dependencies: boolean
          missing_dependencies: string[]
          version: string
          settings: Json
        }[]
      }
      get_module_dependency_tree: {
        Args: { p_workspace_id: string; p_module_name?: string }
        Returns: {
          module_name: string
          display_name: string
          level: number
          is_active: boolean
          depends_on: string[]
          dependents: string[]
          path: string[]
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_workspace_id: {
        Args: { user_id: string }
        Returns: string
      }
      has_workflow_permissions: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_root_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_team_manager: {
        Args: { user_id: string; target_team_id: string }
        Returns: boolean
      }
      is_user_role: {
        Args: {
          user_id: string
          target_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_workspace_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      resolve_activation_order: {
        Args: { p_workspace_id: string; p_modules_to_activate: string[] }
        Returns: {
          activation_order: number
          module_name: string
          display_name: string
          reason: string
          is_required: boolean
        }[]
      }
      user_has_role_in: {
        Args: {
          user_id: string
          roles: Database["public"]["Enums"]["user_role"][]
        }
        Returns: boolean
      }
      validate_module_configuration: {
        Args: {
          p_workspace_id: string
          p_module_name: string
          p_settings: Json
        }
        Returns: {
          is_valid: boolean
          validation_errors: string[]
          warnings: string[]
        }[]
      }
      verify_api_access: {
        Args: { p_user_id: string; p_module_name: string; p_action?: string }
        Returns: boolean
      }
    }
    Enums: {
      contact_status: "lead" | "prospect" | "customer" | "inactive"
      deal_source:
        | "website"
        | "referral"
        | "cold_call"
        | "social_media"
        | "email_campaign"
        | "trade_show"
        | "partner"
        | "existing_customer"
        | "other"
      deal_stage:
        | "lead"
        | "contacted"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost"
      lead_source:
        | "website"
        | "referral"
        | "social_media"
        | "email_campaign"
        | "cold_call"
        | "trade_show"
        | "other"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "blocked"
        | "cancelled"
      user_role: "admin" | "manager" | "employee" | "root"
      workflow_status: "draft" | "active" | "paused" | "completed" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      contact_status: ["lead", "prospect", "customer", "inactive"],
      deal_source: [
        "website",
        "referral",
        "cold_call",
        "social_media",
        "email_campaign",
        "trade_show",
        "partner",
        "existing_customer",
        "other",
      ],
      deal_stage: [
        "lead",
        "contacted",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
      lead_source: [
        "website",
        "referral",
        "social_media",
        "email_campaign",
        "cold_call",
        "trade_show",
        "other",
      ],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: [
        "pending",
        "in_progress",
        "completed",
        "blocked",
        "cancelled",
      ],
      user_role: ["admin", "manager", "employee", "root"],
      workflow_status: ["draft", "active", "paused", "completed", "archived"],
    },
  },
} as const
