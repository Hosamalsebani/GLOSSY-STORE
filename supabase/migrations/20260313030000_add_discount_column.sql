-- Add discount_percentage column to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS discount_percentage numeric DEFAULT 0
  CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- Set all existing products with stock=0 to default stock of 20
UPDATE public.products SET stock = 20 WHERE stock = 0 OR stock IS NULL;

-- Change default stock to 20 for new products
ALTER TABLE public.products ALTER COLUMN stock SET DEFAULT 20;
