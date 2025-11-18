'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Moon, Sun, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // await apiClient.updateProfile({ name });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="text"
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div>
              <Input
                type="email"
                label="Email"
                value={user?.email || ''}
                disabled
                className="opacity-60"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Email cannot be changed
              </p>
            </div>

            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2" size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4 dark:border-dark-border">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={toggleTheme}>
                Toggle
              </Button>
            </div>

            <div className="rounded-lg border p-4 dark:border-dark-border">
              <div className="flex items-center gap-3">
                <User size={20} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Learning Preferences
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Target Language: Spanish
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Native Language: English
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About FluentGym</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300">
            FluentGym is an AI-powered language learning platform that helps you master any
            language through real-world conversations and personalized feedback.
          </p>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Version 0.1.0</p>
        </CardContent>
      </Card>
    </div>
  );
}
