import { User as SupabaseUser } from '@supabase/supabase-js';

export interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  subject_id: string;
  user_id: string;
  subject?: Subject;
}

export interface Subject {
  id: string;
  name: string;
  created_at: string;
}

export type User = SupabaseUser;