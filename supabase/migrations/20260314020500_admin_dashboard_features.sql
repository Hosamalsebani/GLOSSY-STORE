-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_percentage NUMERIC NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    expiration_date TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Admins can manage coupons
CREATE POLICY "Admins can manage coupons" 
    ON coupons FOR ALL
    USING (
      auth.uid() IN (SELECT id FROM admins)
    );

-- Anyone can select valid coupons (for validation during checkout)
CREATE POLICY "Anyone can view coupons" 
    ON coupons FOR SELECT 
    USING (true);

-- Create abandoned_carts table
CREATE TABLE IF NOT EXISTS abandoned_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_email TEXT,
    customer_phone TEXT,
    cart_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'abandoned' CHECK (status IN ('abandoned', 'recovered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for abandoned carts
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage abandoned carts
CREATE POLICY "Admins can manage abandoned carts" 
    ON abandoned_carts FOR ALL
    USING (
      auth.uid() IN (SELECT id FROM admins)
    );

-- Users can insert and update their own abandoned carts
CREATE POLICY "Users can manage their own abandoned carts" 
    ON abandoned_carts FOR ALL
    USING (
      auth.uid() = user_id OR user_id IS NULL
    );
