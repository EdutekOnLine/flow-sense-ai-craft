
-- Create user_presence table to track online/offline status
CREATE TABLE public.user_presence (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online boolean NOT NULL DEFAULT false,
  last_seen timestamp with time zone NOT NULL DEFAULT now(),
  session_id text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_presence table
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Policy: Users can update their own presence
CREATE POLICY "Users can update own presence" 
  ON public.user_presence 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own presence
CREATE POLICY "Users can insert own presence" 
  ON public.user_presence 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Only root users can view all presence data
CREATE POLICY "Root users can view all presence" 
  ON public.user_presence 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'root'
    )
  );

-- Policy: Users can view their own presence
CREATE POLICY "Users can view own presence" 
  ON public.user_presence 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Enable real-time for user_presence table
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;

-- Add trigger to update updated_at timestamp
CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON public.user_presence 
  FOR EACH ROW 
  EXECUTE PROCEDURE public.handle_updated_at();
