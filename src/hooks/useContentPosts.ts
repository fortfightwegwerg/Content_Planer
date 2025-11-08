import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';

export interface ContentPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  platform: string;
  category: string;
  hashtags: string;
  scheduled_date: string;
  scheduled_time: string;
  assignee: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useContentPosts = () => {
  const supabase = useSupabase();
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('content_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setPosts(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [supabase]);

  const createPost = async (postData: Omit<ContentPost, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      console.log('Session check:', {
        hasSession: !!sessionData.session,
        hasUser: !!sessionData.session?.user,
        sessionError
      });

      if (sessionError) throw sessionError;
      if (!sessionData.session || !sessionData.session.user) {
        throw new Error('Not authenticated - Please log in again');
      }

      const dataToInsert = {
        user_id: sessionData.session.user.id,
        title: postData.title,
        content: postData.content,
        platform: postData.platform,
        category: postData.category,
        hashtags: postData.hashtags,
        scheduled_date: postData.scheduled_date || null,
        scheduled_time: postData.scheduled_time,
        assignee: postData.assignee,
        status: postData.status,
      };

      console.log('Inserting post:', dataToInsert);

      const { data, error: insertError } = await supabase
        .from('content_posts')
        .insert(dataToInsert)
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('Post created successfully:', data);
      if (data) {
        setPosts([data, ...posts]);
        return data.id;
      }
      throw new Error('No data returned from insert');
    } catch (err) {
      console.error('Error in createPost:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error creating post';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (id: string, postData: Partial<ContentPost>) => {
    try {
      const { error: updateError } = await supabase
        .from('content_posts')
        .update(postData)
        .eq('id', id);

      if (updateError) throw updateError;

      setPosts(posts.map(p => p.id === id ? { ...p, ...postData } : p));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error updating post';
      setError(errorMsg);
      throw err;
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('content_posts')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error deleting post';
      setError(errorMsg);
      throw err;
    }
  };

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
  };
};