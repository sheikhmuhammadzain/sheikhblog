export interface Subject {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  subject_id: string;
  subject?: Subject;
}

export interface User {
  id: string;
  email: string;
}