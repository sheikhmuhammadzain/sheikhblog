import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Clock, 
  CalendarDays,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import type { Post } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPosts();
  }, [user, navigate]);

  async function fetchPosts() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*, subject:subjects(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch posts',
          variant: 'destructive',
        });
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function deletePost(id: string) {
    try {
      // Verify the post belongs to the user before deleting
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!post || post.user_id !== user?.id) {
        toast({
          title: 'Error',
          description: 'You do not have permission to delete this post',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id); // Extra security to ensure only user's posts can be deleted

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete post',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
      setPostToDelete(null);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  }

  function calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  }

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 py-4 sm:py-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Manage Posts</h1>
            <p className="text-muted-foreground mt-1">Loading your posts...</p>
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/4 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-2/3 mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Manage Posts</h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and manage your blog posts
          </p>
        </div>
        <Link to="/admin/posts/new">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card className="p-4 sm:p-8 text-center">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">No Posts Yet</h2>
            <p className="text-muted-foreground">
              You haven't created any posts yet. Get started by creating your first post!
            </p>
            <Link to="/admin/posts/new">
              <Button className="w-full sm:w-auto">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Post
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="group overflow-hidden">
              <CardHeader className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="text-lg sm:text-xl truncate group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {post.subject?.name}
                      </Badge>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {format(new Date(post.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{calculateReadTime(post.content)}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        {post.published ? (
                          <>
                            <Eye className="h-3 w-3 flex-shrink-0" />
                            <span className="text-green-600 dark:text-green-400">Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 flex-shrink-0" />
                            <span className="text-yellow-600 dark:text-yellow-400">Draft</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Link to={`/admin/posts/${post.id}/edit`}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Edit post</span>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:text-red-600 dark:hover:text-red-400"
                      onClick={() => setPostToDelete(post.id)}
                    >
                      <span className="sr-only">Delete post</span>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {post.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => postToDelete && deletePost(postToDelete)}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}