import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { Post, Subject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { format } from "date-fns";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('posts')
          .select('*, subject:subjects(id,name)')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (selectedSubject !== null) {
          query = query.eq('subject_id', selectedSubject);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Query error:', error);
          throw error;
        }

        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [selectedSubject]);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const { data: subjectsData } = await supabase.from('subjects').select('*');
        setSubjects(subjectsData || []);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    }

    fetchSubjects();
  }, []);

  const calculateReadTime = (content: string): string => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMMM d, yyyy');
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  return (
    <div className="w-full max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="w-full sm:w-auto max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <Button
              key={subject.id}
              variant={selectedSubject === subject.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSubject(prev => prev === subject.id ? null : subject.id)}
              className="text-sm"
            >
              {subject.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeletons
          [...Array(6)].map((_, i) => (
            <Card key={i} className="h-[200px] animate-pulse bg-muted" />
          ))
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-muted-foreground">No posts found.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`}>
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.content}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatDate(post.created_at)}</span>
                      <span>{calculateReadTime(post.content)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
