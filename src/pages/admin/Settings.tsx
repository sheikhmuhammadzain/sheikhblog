import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    emailNotifications: false,
    allowComments: true,
    requireModeration: true
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data: siteSettings, error } = await supabase
          .from('site_settings')
          .select('*')
          .single();

        if (error) throw error;
        if (siteSettings) {
          setSettings({
            siteName: siteSettings.site_name || '',
            siteDescription: siteSettings.site_description || '',
            emailNotifications: siteSettings.email_notifications || false,
            allowComments: siteSettings.allow_comments ?? true,
            requireModeration: siteSettings.require_moderation ?? true
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      }
    }

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 1, // Single row for site settings
          site_name: settings.siteName,
          site_description: settings.siteDescription,
          email_notifications: settings.emailNotifications,
          allow_comments: settings.allowComments,
          require_moderation: settings.requireModeration,
          theme: theme
        });

      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Manage your blog settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure your blog's basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input
              id="site-name"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              placeholder="My Study Blog"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-description">Site Description</Label>
            <Textarea
              id="site-description"
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              placeholder="A blog about learning and sharing knowledge"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how your blog looks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Toggle between light and dark theme
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments & Notifications</CardTitle>
          <CardDescription>
            Manage comment settings and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-comments">Allow Comments</Label>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Enable or disable comments on blog posts
              </div>
            </div>
            <Switch
              id="allow-comments"
              checked={settings.allowComments}
              onCheckedChange={(checked) => setSettings({ ...settings, allowComments: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require-moderation">Require Moderation</Label>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Review comments before they are published
              </div>
            </div>
            <Switch
              id="require-moderation"
              checked={settings.requireModeration}
              onCheckedChange={(checked) => setSettings({ ...settings, requireModeration: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Email Notifications</Label>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Receive email notifications for new comments
              </div>
            </div>
            <Switch
              id="notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSaveSettings}
        className="w-full sm:w-auto"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Settings'
        )}
      </Button>
    </div>
  );
}
