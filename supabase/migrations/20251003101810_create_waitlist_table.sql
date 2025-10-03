/*
  # Create waitlist table

  1. New Tables
    - `waitlist`
      - `id` (uuid, primary key) - Unique identifier for each waitlist entry
      - `email` (text, unique, not null) - Email address of the user
      - `created_at` (timestamptz) - Timestamp when the user joined the waitlist
  
  2. Security
    - Enable RLS on `waitlist` table
    - Add policy for anonymous users to insert their email (public signup)
    - No select/update/delete policies as this is write-only for public users
  
  3. Important Notes
    - Email addresses are stored uniquely to prevent duplicate signups
    - RLS allows public INSERT only, keeping data secure
    - Created timestamp automatically set on insertion
*/

CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);