-- Add role column to profiles with limited set of values
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'dj';

-- Add a CHECK constraint to ensure only allowed values are stored
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_role_check CHECK (role IN ('dj', 'admin', 'producer'));
  END IF;
END$$;

-- Make sure existing rows without role get a sane default
UPDATE profiles SET role = 'dj' WHERE role IS NULL;
