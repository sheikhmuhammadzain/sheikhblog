import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, FileText, Settings } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              New Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/admin/posts/new">
              <Button className="w-full">Create Post</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Manage Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/admin/posts">
              <Button variant="outline" className="w-full">View All Posts</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/admin/settings">
              <Button variant="outline" className="w-full">Manage Settings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}