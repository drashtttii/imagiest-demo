import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywfahghfxgqipvvjgfte.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZmFoZ2hmeGdxaXB2dmpnZnRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NjcxOTgsImV4cCI6MjA0ODE0MzE5OH0.aEBemiBVKgkM_OYh3xG-LaXvIFp6rQNvTI843UZp0pY';

export const supabase = createClient(supabaseUrl, supabaseKey);