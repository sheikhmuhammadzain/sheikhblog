import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface PostData {
  id: string;
  title: string;
  content: string;
  created_at: string;
  subject: {
    id: string;
    name: string;
  } | null;
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, subject:subjects(id,name)')
          .eq('id', id)
          .eq('published', true)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPost();
  }, [id]);

  const calculateReadTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4 animate-pulse" />
          <div className="space-y-2 mt-8">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      ) : post ? (
        <article className="prose prose-zinc dark:prose-invert max-w-none">
          <h1 className="mb-2">{post.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            {post.subject && (
              <Badge variant="secondary">{post.subject.name}</Badge>
            )}
            <span>•</span>
            <time dateTime={post.created_at}>
              {format(new Date(post.created_at), 'MMMM d, yyyy')}
            </time>
            <span>•</span>
            <span>{calculateReadTime(post.content)} min read</span>
          </div>
          <div className="whitespace-pre-wrap">{post.content}</div>
        </article>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Post not found</h2>
          <p className="text-muted-foreground mb-4">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      )}
    </div>
  );
}
