import { useState, useEffect, useCallback } from 'react';
import type { Tag } from '../types/expense';
import { subscribeToTags, addTag as addTagService } from '../services/tagService';
import { useAuth } from '../contexts/AuthContext';

export function useTags() {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTags([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToTags(user.uid, (data) => {
      setTags(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addTag = useCallback(async (name: string) => {
    if (!user) {
      throw new Error('Must be logged in to add tags');
    }
    return await addTagService(user.uid, name);
  }, [user]);

  return { tags, loading, addTag };
}
