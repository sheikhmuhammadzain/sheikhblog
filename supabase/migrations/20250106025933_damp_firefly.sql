/*
  # Initial Schema for StudyBuddy Blog

  1. New Tables
    - `subjects` - Computer science subject categories
      - `id` (uuid, primary key)
      - `name` (text) - Subject name
      - `slug` (text) - URL-friendly name
      - `created_at` (timestamp)
    
    - `posts` - Blog posts
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `subject_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key)
      - `published` (boolean)

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users and public access
*/

-- Create subjects table
CREATE TABLE subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create posts table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  subject_id uuid REFERENCES subjects(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policies for subjects
CREATE POLICY "Allow public read access to subjects"
  ON subjects
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to create subjects"
  ON subjects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for posts
CREATE POLICY "Allow public read access to published posts"
  ON posts
  FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Allow authenticated users to CRUD their own posts"
  ON posts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert initial subjects
INSERT INTO subjects (name, slug) VALUES
  ('Programming Languages', 'programming-languages'),
  ('Web Development', 'web-development'),
  ('Data Structures', 'data-structures'),
  ('Algorithms', 'algorithms'),
  ('Database Systems', 'database-systems'),
  ('Computer Networks', 'computer-networks'),
  ('Operating Systems', 'operating-systems'),
  ('Software Engineering', 'software-engineering'),
  ('Artificial Intelligence', 'artificial-intelligence'),
  ('Machine Learning', 'machine-learning');