-- Create client_additional_data table
CREATE TABLE IF NOT EXISTS public.client_additional_data (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL,
  quantity integer DEFAULT 1,
  brand_model text,
  has_external_battery boolean DEFAULT false,
  has_generator boolean DEFAULT false,
  observation text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_additional_data ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view additional data" ON public.client_additional_data
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM public.clients WHERE id = client_id
  ));

CREATE POLICY "Users can insert additional data" ON public.client_additional_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update additional data" ON public.client_additional_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete additional data" ON public.client_additional_data
  FOR DELETE USING (auth.uid() = user_id);

-- Notify
SELECT pg_notify('pgrst', 'reload schema');
