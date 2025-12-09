-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  min_price NUMERIC DEFAULT 0,
  max_price NUMERIC DEFAULT 1000000,
  preferred_locations TEXT[] DEFAULT ARRAY[]::TEXT[],
  international BOOLEAN DEFAULT FALSE,
  urgency_level TEXT DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high')),
  notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('instant', 'daily', 'weekly')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT FALSE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, NOW()) NOT NULL
);

-- Add missing columns if they don't exist (for existing tables)
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT FALSE;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT FALSE;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS international BOOLEAN DEFAULT FALSE;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS notification_frequency TEXT DEFAULT 'daily';
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only see and modify their own preferences
CREATE POLICY user_preferences_select ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY user_preferences_insert ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_preferences_update ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_preferences_delete ON user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences(user_id);
