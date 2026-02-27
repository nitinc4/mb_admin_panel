/*
  # User & Tier Management Schema

  1. New Tables
    - `user_tiers`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the tier/group
      - `description` (text) - Description of the tier
      - `price` (numeric) - Monthly/recurring price for this tier
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `phone` (text)
      - `fcm_token` (text) - Firebase Cloud Messaging token for push notifications
      - `tier_id` (uuid, foreign key to user_tiers)
      - `is_active` (boolean) - Whether user has active access
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated admin access
*/

CREATE TABLE IF NOT EXISTS user_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text DEFAULT '',
  fcm_token text DEFAULT '',
  tier_id uuid REFERENCES user_tiers(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read user_tiers"
  ON user_tiers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert user_tiers"
  ON user_tiers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update user_tiers"
  ON user_tiers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete user_tiers"
  ON user_tiers FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_users_tier_id ON users(tier_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);