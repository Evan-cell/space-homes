-- Create a table for user profiles
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY, -- Clerk User ID
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('tenant', 'landlord')),
  phone TEXT,
  whatsapp TEXT,
  avatar_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure avatar_url exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

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

-- Listing Views tracking
CREATE TABLE IF NOT EXISTS public.listing_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    viewer_id TEXT, -- Clerk user ID
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks tracking
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Clerk user ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(listing_id, user_id)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id TEXT NOT NULL,
    landlord_id TEXT NOT NULL,
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure foreign keys on conversations
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_tenant_id_fkey') THEN
        ALTER TABLE public.conversations ADD CONSTRAINT conversations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_landlord_id_fkey') THEN
        ALTER TABLE public.conversations ADD CONSTRAINT conversations_landlord_id_fkey FOREIGN KEY (landlord_id) REFERENCES public.profiles(id);
    END IF;
END $$;

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to listings if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='bedrooms') THEN
        ALTER TABLE public.listings ADD COLUMN bedrooms INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='bathrooms') THEN
        ALTER TABLE public.listings ADD COLUMN bathrooms INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='space_size') THEN
        ALTER TABLE public.listings ADD COLUMN space_size TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='phone_number') THEN
        ALTER TABLE public.listings ADD COLUMN phone_number TEXT;
    END IF;
END $$;

-- RLS for new tables
ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies for new tables
DROP POLICY IF EXISTS "Anyone can insert views" ON public.listing_views;
CREATE POLICY "Anyone can insert views" ON public.listing_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can manage their own bookmarks" ON public.bookmarks 
FOR ALL USING (user_id = auth.uid()::text);

-- Policies for Chat
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations" ON public.conversations
    FOR SELECT USING (auth.uid()::text = tenant_id OR auth.uid()::text = landlord_id);

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = messages.conversation_id 
            AND (tenant_id = auth.uid()::text OR landlord_id = auth.uid()::text)
        )
    );

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid()::text = sender_id);
