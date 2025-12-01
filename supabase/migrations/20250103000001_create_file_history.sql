CREATE TABLE IF NOT EXISTS public.file_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name text NOT NULL,
    original_text text NOT NULL,
    processed_text text NOT NULL,
    bold_intensity integer NOT NULL DEFAULT 50,
    file_size integer,
    file_type text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_file_history_user_id ON public.file_history(user_id);
CREATE INDEX IF NOT EXISTS idx_file_history_created_at ON public.file_history(created_at DESC);

DROP POLICY IF EXISTS "Users can view own file history" ON public.file_history;
CREATE POLICY "Users can view own file history"
ON public.file_history FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own file history" ON public.file_history;
CREATE POLICY "Users can insert own file history"
ON public.file_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own file history" ON public.file_history;
CREATE POLICY "Users can update own file history"
ON public.file_history FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own file history" ON public.file_history;
CREATE POLICY "Users can delete own file history"
ON public.file_history FOR DELETE
USING (auth.uid() = user_id);

ALTER TABLE public.file_history ENABLE ROW LEVEL SECURITY;

alter publication supabase_realtime add table file_history;