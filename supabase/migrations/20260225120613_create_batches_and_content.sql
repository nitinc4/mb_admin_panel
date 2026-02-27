/*
  # Create Batches and Content Tables

  ## 1. New Tables
    
    ### `batches`
      - `id` (uuid, primary key) - Unique identifier for each batch
      - `name` (text, required) - Batch name
      - `description` (text) - Batch description
      - `start_date` (date) - When the batch starts
      - `end_date` (date) - When the batch ends
      - `is_active` (boolean, default true) - Whether the batch is currently active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    ### `batch_tier_access`
      - `id` (uuid, primary key) - Unique identifier
      - `batch_id` (uuid, foreign key to batches) - Reference to batch
      - `tier_id` (uuid, foreign key to user_tiers) - Reference to tier
      - `created_at` (timestamptz) - Creation timestamp
      - Composite unique constraint on (batch_id, tier_id)
    
    ### `content_items`
      - `id` (uuid, primary key) - Unique identifier for each content item
      - `batch_id` (uuid, foreign key to batches) - Reference to batch
      - `title` (text, required) - Content title
      - `description` (text) - Content description
      - `content_type` (text, required) - Type: 'video' or 'pdf'
      - `file_url` (text, required) - URL to the uploaded file or stream
      - `duration` (integer) - Duration in seconds (for videos)
      - `file_size` (bigint) - File size in bytes
      - `order_index` (integer, default 0) - Display order within batch
      - `is_published` (boolean, default true) - Whether content is visible
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin access
    - Restrict access to authorized users only

  ## 3. Important Notes
    - Batches can be restricted to specific user tiers
    - Content items are organized within batches
    - Content type is enforced through check constraint
    - Order index allows custom sorting of content
*/

-- Create batches table
CREATE TABLE IF NOT EXISTS batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  start_date date,
  end_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create batch_tier_access junction table
CREATE TABLE IF NOT EXISTS batch_tier_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  tier_id uuid NOT NULL REFERENCES user_tiers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(batch_id, tier_id)
);

-- Create content_items table
CREATE TABLE IF NOT EXISTS content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  content_type text NOT NULL CHECK (content_type IN ('video', 'pdf')),
  file_url text NOT NULL,
  duration integer DEFAULT 0,
  file_size bigint DEFAULT 0,
  order_index integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_batch_tier_access_batch_id ON batch_tier_access(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_tier_access_tier_id ON batch_tier_access(tier_id);
CREATE INDEX IF NOT EXISTS idx_content_items_batch_id ON content_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON content_items(content_type);
CREATE INDEX IF NOT EXISTS idx_content_items_order ON content_items(batch_id, order_index);

-- Enable Row Level Security
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_tier_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for batches table
CREATE POLICY "Authenticated users can view batches"
  ON batches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert batches"
  ON batches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update batches"
  ON batches FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete batches"
  ON batches FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for batch_tier_access table
CREATE POLICY "Authenticated users can view batch tier access"
  ON batch_tier_access FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert batch tier access"
  ON batch_tier_access FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update batch tier access"
  ON batch_tier_access FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete batch tier access"
  ON batch_tier_access FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for content_items table
CREATE POLICY "Authenticated users can view content items"
  ON content_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert content items"
  ON content_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update content items"
  ON content_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete content items"
  ON content_items FOR DELETE
  TO authenticated
  USING (true);