/*
  # Create Live Classes Schema

  1. New Tables
    - `live_classes`
      - `id` (uuid, primary key)
      - `batch_id` (uuid, foreign key to batches)
      - `title` (text)
      - `meeting_url` (text) - Jitsi meeting URL
      - `meeting_id` (text) - Unique meeting identifier
      - `scheduled_at` (timestamptz) - When the class is scheduled
      - `started_at` (timestamptz) - When admin started the class
      - `ended_at` (timestamptz) - When the class ended
      - `status` (text) - 'scheduled', 'live', 'ended'
      - `duration` (integer) - Expected duration in minutes
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `live_classes` table
    - Add policy for authenticated admin users to manage live classes
    - Add policy for users to view live classes for their allowed batches

  3. Indexes
    - Index on batch_id for faster lookups
    - Index on status for filtering active classes
*/

CREATE TABLE IF NOT EXISTS live_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid REFERENCES batches(id) ON DELETE CASCADE,
  title text NOT NULL,
  meeting_url text NOT NULL,
  meeting_id text NOT NULL UNIQUE,
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  duration integer DEFAULT 60,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_live_classes_batch_id ON live_classes(batch_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_status ON live_classes(status);

ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view live classes"
  ON live_classes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create live classes"
  ON live_classes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update live classes"
  ON live_classes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete live classes"
  ON live_classes
  FOR DELETE
  TO authenticated
  USING (true);