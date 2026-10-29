import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { PostForm, type PostFormData } from '@/components/forms/PostForm';
import { supabase } from '@/lib/supabase';
import type { Post } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPost();
  }, [id, user]);

  async function fetchPost() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          title: 'Error',
          description: 'Post not found',
          variant: 'destructive',
        });
        navigate('/admin/posts');
        return;
      }

      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch post',
        variant: 'destructive',
      });
      navigate('/admin/posts');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: PostFormData) {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('posts')
        .update({
          title: data.title,
          content: data.content,
          subject_id: data.subject_id,
        })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Post updated successfully',
      });
      navigate('/admin/posts');
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4 sm:mb-8"></div>
          <div className="space-y-4 sm:space-y-6">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-40 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Edit Post</h1>
      <PostForm
        onSubmit={handleSubmit}
        defaultValues={{
          title: post.title,
          content: post.content,
          subject_id: post.subject_id,
        }}
        submitLabel="Update Post"
        loading={loading}
        onCancel={() => navigate('/admin/posts')}
      />
    </div>
  );
}