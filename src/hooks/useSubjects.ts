import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Subject } from '@/lib/types';

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('name');

        if (error) throw error;
        setSubjects(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch subjects'));
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
  }, []);

  return { subjects, loading, error };
}