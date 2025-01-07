import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { Post, Subject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Clock, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("posts")
          .select("*, subject:subjects(id,name)")
          .eq("published", true)
          .order("created_at", { ascending: false });

        if (selectedSubject !== null) {
          query = query.eq("subject_id", selectedSubject);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Query error:", error);
          throw error;
        }

        setPosts(data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [selectedSubject]);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const { data: subjectsData } = await supabase
          .from("subjects")
          .select("*");
        setSubjects(subjectsData || []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
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
    return format(new Date(date), "MMMM d, yyyy");
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(
      (post) =>
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
              variant={selectedSubject === subject.id ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setSelectedSubject((prev) =>
                  prev === subject.id ? null : subject.id
                )
              }
              className="text-sm"
            >
              {subject.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Card
              key={i}
              className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border-zinc-200/80 dark:border-zinc-700/80"
            >
              <CardHeader className="space-y-2">
                <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full animate-pulse" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-4/6 animate-pulse" />
              </CardContent>
            </Card>
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
              <Card className="group h-full hover:shadow-lg transition-all duration-300 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border-zinc-200/80 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600 cursor-pointer">
                <CardHeader>
                  <div className="space-y-2">
                    <CardTitle className="text-xl font-semibold leading-none tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      {post.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {post.subject && (
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium"
                        >
                          {post.subject.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-zinc-600 dark:text-zinc-300">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{calculateReadTime(post.content)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {user && (
        <Link
          to="/admin/posts/new"
          className="fixed right-4 bottom-4 sm:right-8 sm:bottom-8 z-50"
        >
          <Button
            size="lg"
            className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl p-0 bg-white hover:bg-blue-700 dark:bg-white dark:hover:bg-blue-600"
          >
            <PlusCircle className="h-6 w-6" />
            <span className="sr-only">Create new post</span>
          </Button>
        </Link>
      )}
    </div>
  );
}
