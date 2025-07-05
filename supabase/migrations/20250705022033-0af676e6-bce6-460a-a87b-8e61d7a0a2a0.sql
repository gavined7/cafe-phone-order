-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE 
      WHEN role = 'admin' THEN 1
      WHEN role = 'moderator' THEN 2
      WHEN role = 'user' THEN 3
    END
  LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create settings table for cafe settings
CREATE TABLE public.cafe_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    type TEXT NOT NULL DEFAULT 'text', -- text, image, json
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on settings
ALTER TABLE public.cafe_settings ENABLE ROW LEVEL SECURITY;

-- Settings are viewable by everyone but only manageable by admins
CREATE POLICY "Settings are viewable by everyone"
ON public.cafe_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage settings"
ON public.cafe_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.cafe_settings (key, value, type) VALUES
('cafe_name', 'Login Cafe', 'text'),
('cafe_description', 'Serving premium coffee and fresh pastries since 2024. We''re passionate about creating the perfect cafe experience with artisanal drinks and warm hospitality.', 'text'),
('address_line1', '123 Coffee Street', 'text'),
('address_line2', 'Downtown District', 'text'),
('city_state_zip', 'City, State 12345', 'text'),
('phone', '(555) 123-CAFE', 'text'),
('email', 'hello@logincafe.com', 'text'),
('hours_weekday', 'Mon-Fri: 6:00 AM - 8:00 PM', 'text'),
('hours_weekend', 'Sat-Sun: 7:00 AM - 9:00 PM', 'text'),
('social_handle', '@LoginCafe', 'text');

-- Update products table RLS for admin management
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update categories table RLS for admin management  
CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updating updated_at on settings
CREATE TRIGGER update_cafe_settings_updated_at
BEFORE UPDATE ON public.cafe_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();