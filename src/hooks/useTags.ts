import { useState, useEffect, useCallback } from 'react';
import type { Tag } from '../types/expense';
import { subscribeToTags, addTag as addTagService } from '../services/tagService';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToTags((data) => {
      setTags(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addTag = useCallback(async (name: string) => {
    return await addTagService(name);
  }, []);

  return { tags, loading, addTag };
}
