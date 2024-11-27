import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Image } from '../types';
import { supabase } from '../lib/supabase';

export function useImages(searchQuery: string = '') {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { ref, inView } = useInView();

  const fetchImages = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('images')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(page * 20, (page + 1) * 20 - 1);

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      if (data) {
        setImages(prev => page === 0 ? data : [...prev, ...data]);
        setHasMore(data.length === 20);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    setImages([]);
    fetchImages();
  }, [searchQuery]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }, [inView, hasMore]);

  useEffect(() => {
    if (page > 0) {
      fetchImages();
    }
  }, [page]);

  return { images, loading, error, hasMore, ref };
}