import { supabase } from './supabase';

export async function setupSupabase() {
  try {
    // Create images table if it doesn't exist
    const { error: tableError } = await supabase.from('images').select('*').limit(1);

    if (tableError?.code === 'PGRST204') {
      await supabase.rpc('create_table_if_not_exists', {
        table_sql: `
          CREATE TABLE IF NOT EXISTS images (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            alt_text TEXT NOT NULL,
            url TEXT NOT NULL,
            category TEXT NOT NULL,
            tags TEXT[] NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
        `
      });
    }

    // Initialize storage bucket
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      
      if (!buckets?.some(bucket => bucket.name === 'images')) {
        await supabase.storage.createBucket('images', {
          public: true,
          fileSizeLimit: 10485760,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        });
      }
    } catch (storageError) {
      // If storage operations fail, log but don't throw
      // This allows the app to work even if storage setup fails
      console.warn('Storage setup incomplete:', storageError);
    }

    console.log('Supabase setup completed');
  } catch (error) {
    console.error('Database setup error:', error);
    // Don't throw the error to allow the app to continue
  }
}