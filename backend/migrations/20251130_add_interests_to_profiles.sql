-- Add a new text[] column to store user interests/categories on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS interests text[];

-- Optional: ensure column exists with NULL default (explicit for clarity)
ALTER TABLE public.profiles
  ALTER COLUMN interests SET DEFAULT NULL;
