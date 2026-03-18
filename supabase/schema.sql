-- Create a table for user profiles
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY, -- Clerk User ID
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('tenant', 'landlord')),
  phone TEXT,
  whatsapp TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Separate table for property listings
CREATE TABLE public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price TEXT NOT NULL, -- e.g., "KES 8,500"
  price_value NUMERIC NOT NULL, -- e.g., 8500
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  rating NUMERIC DEFAULT 0,
  description TEXT,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  space_size INTEGER, -- in sqft
  phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
-- Users can view all profiles (to see landlord info)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- Users can only update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid()::text = id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Listings Policies
-- Everyone can view listings
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;
CREATE POLICY "Listings are viewable by everyone" 
ON public.listings FOR SELECT USING (true);

-- Landlords can insert their own listings
DROP POLICY IF EXISTS "Landlords can insert their own listings" ON public.listings;
CREATE POLICY "Landlords can insert their own listings" 
ON public.listings FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid()::text AND role = 'landlord'
  )
);

-- Landlords can update their own listings
DROP POLICY IF EXISTS "Landlords can update their own listings" ON public.listings;
CREATE POLICY "Landlords can update their own listings" 
ON public.listings FOR UPDATE USING (
  landlord_id = auth.uid()::text
);

-- Landlords can delete their own listings
DROP POLICY IF EXISTS "Landlords can delete their own listings" ON public.listings;
CREATE POLICY "Landlords can delete their own listings" 
ON public.listings FOR DELETE USING (
  landlord_id = auth.uid()::text
);

-- Function to handle timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Storage Configuration
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for property-images bucket
-- Allow public to select images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

-- Allow anyone to upload (for simplicity in this demo, usually authenticated)
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images');

-- Note: In a production app, you'd want closer integration with Clerk JWT,
-- but for now this enables unblocked development.
