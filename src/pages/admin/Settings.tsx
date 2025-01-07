import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
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
    <div className="px-4 sm:px-6 py-4 sm:py-8 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your blog settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Settings</CardTitle>
          <CardDescription>
            Configure your blog's information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="site-name">Blog Name</Label>
            <Input
              id="site-name"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              placeholder="My Study Blog"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-description">Blog Description</Label>
            <Textarea
              id="site-description"
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              placeholder="A blog about learning and sharing knowledge"
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
            Saving Changes...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  );
}
