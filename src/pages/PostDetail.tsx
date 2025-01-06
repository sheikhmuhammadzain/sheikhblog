import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

// Function to calculate read time
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

// Function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            subjects (
              id,
              name
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching post:', error);
          return;
        }

        if (!data) {
          console.error('Post not found');
          return;
        }

        setPost(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchPost();
    }
  }, [id]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="space-y-2 mt-8">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      ) : post ? (
        <article className="prose prose-zinc dark:prose-invert max-w-none">
          <h1 className="mb-2">{post.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Badge variant="secondary">{post.subject?.name}</Badge>
            <span>•</span>
            <time dateTime={post.created_at}>
              {formatDate(post.created_at)}
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
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mt-4"
          >
            Go back home
          </Button>
        </div>
      )}
    </div>
  );
}
