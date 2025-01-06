import { Link } from 'react-router-dom';
import { BookOpen, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/60"
    >
      <div className="w-full px-4 lg:px-8 h-16">
        <div className="h-full flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
          >
            <div className="relative">
              <BookOpen className="h-6 w-6 text-zinc-100 transition-transform duration-200 group-hover:scale-110" />
              <div className="absolute inset-0 bg-blue-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <span className="font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-200">
              Sheikh Blog
            </span>
          </Link>

          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-9 w-9 rounded-full p-0 bg-zinc-900/50 hover:bg-zinc-800/50"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-zinc-950">
                      <AvatarImage 
                        src={user.photoURL || undefined} 
                        alt={user.displayName || 'User'} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-zinc-800">
                        <User className="h-4 w-4 text-zinc-400" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 mt-2 bg-zinc-900/80 backdrop-blur-lg border border-zinc-800/80"
                >
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <p className="text-sm font-medium truncate text-zinc-100">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/admin" 
                      className="flex items-center cursor-pointer py-2 px-3 hover:bg-zinc-800/80 transition-colors"
                    >
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="cursor-pointer text-red-400 hover:bg-red-950/30 transition-colors"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" className="bg-zinc-900/50 hover:bg-zinc-800/50">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}