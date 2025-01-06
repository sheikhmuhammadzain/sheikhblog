import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { Post, Subject } from "@/lib/types";
import { ChevronDown, Search, BookOpen, Clock, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const { data: subjectsData } = await supabase.from('subjects').select('*');
        setSubjects(subjectsData || []);

        let query = supabase
          .from('posts')
          .select(`
            *,
            subject:subjects (
              id,
              name
            )
          `)
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (selectedSubject !== 'all') {
          query = query.eq('subject_id', selectedSubject);
        }

        const { data: postsData, error } = await query;

        if (error) {
          console.error('Query error:', error);
          throw error;
        }

        // Get the current user's email
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserEmail = session?.user?.email;

        // Map posts with user email
        const postsWithUsers = (postsData || []).map(post => ({
          ...post,
          userEmail: post.user_id === session?.user?.id ? currentUserEmail : 'Anonymous'
        }));

        setPosts(postsWithUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedSubject]);

  // Calculate read time based on content length
  const calculateReadTime = (content: string): string => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Format date
  const formatDate = (date: string): string => {
    return format(new Date(date), 'MMMM d, yyyy');
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              className="pl-10 w-full"
            />
          </div>
        </div>

        <div className="relative w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full sm:w-auto justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter by Subject</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full mt-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm shadow-lg border border-zinc-200/80 dark:border-zinc-700/80 py-1"
              >
                <button
                  onClick={() => {
                    setSelectedSubject("all");
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors duration-150"
                >
                  All Subjects
                </button>
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => {
                      setSelectedSubject(subject.id);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors duration-150"
                  >
                    {subject.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {isLoading
          ? // Loading skeletons
            [...Array(6)].map((_, i) => (
              <Card
                key={i}
                className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border-zinc-200/80 dark:border-zinc-700/80"
              >
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/4 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mt-2" />
                  <Skeleton className="h-4 w-4/6 mt-2" />
                </CardContent>
              </Card>
            ))
          : filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card 
                  className="group h-full hover:shadow-lg transition-all duration-300 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border-zinc-200/80 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600 cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/posts/${post.id}`)}
                >
                  {post.image_url && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-semibold leading-none tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {post.title}
                      </CardTitle>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {post.subject?.name}
                        </Badge>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          by {post.userEmail}
                        </span>
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
              </motion.div>
            ))}
      </div>
    </div>
  );
}
