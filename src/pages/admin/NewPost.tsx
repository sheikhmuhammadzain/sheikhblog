import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { PostForm, type PostFormData } from '@/components/forms/PostForm';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function NewPost() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  async function handleSubmit(data: PostFormData) {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a post',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            ...data,
            user_id: user.id,
            published: true,
          },
        ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Post created successfully',
      });

      navigate('/admin/posts');
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
      <PostForm 
        onSubmit={handleSubmit}
        submitLabel="Create Post"
        onCancel={() => navigate('/admin/posts')}
      />
    </div>
  );
}