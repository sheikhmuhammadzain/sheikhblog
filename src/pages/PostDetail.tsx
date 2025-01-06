import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Post } from '@/lib/types';
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-6 w-[300px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Post not found</h2>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mt-4"
        >
          Go back home
        </Button>
      </div>
    );
  }

  const readTime = calculateReadTime(post.content);

  return (
    <div className="max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {post.image_url && (
        <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <Card className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border-zinc-200/80 dark:border-zinc-700/80">
        <CardHeader className="space-y-4">
          <div className="space-y-4">
            <CardTitle className="text-2xl font-bold">
              {post.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-4">
              {post.subjects && (
                <Badge variant="secondary">
                  {post.subjects.name}
                </Badge>
              )}
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <Clock className="h-4 w-4" />
                <span>{readTime} min read</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-zinc dark:prose-invert">
            {post.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
