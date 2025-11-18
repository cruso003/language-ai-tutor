'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DashboardStats } from '@/types';
import { apiClient } from '@/lib/api-client';
import { Play, TrendingUp, Flame, Clock } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Set default stats if API fails
        setStats({
          totalSessions: 0,
          totalMinutes: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageFluencyScore: 0,
          recentSessions: [],
          weeklyProgress: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back!
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Ready to practice today?
          </p>
        </div>
        <Button onClick={() => router.push('/practice')} size="lg">
          <Play className="mr-2" size={20} />
          Start Practice
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Current Streak
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.currentStreak || 0}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  days
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
                <Flame className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Sessions
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalSessions || 0}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  completed
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Time
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalMinutes || 0}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  minutes
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <Clock className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg. Fluency
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {Math.round(stats?.averageFluencyScore || 0)}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  out of 100
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <button
              onClick={() => router.push('/practice')}
              className="rounded-lg border-2 border-gray-200 p-6 text-left transition-all hover:border-primary hover:bg-primary/5 dark:border-dark-border dark:hover:border-primary"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Start Practice
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Choose a scenario and begin learning
              </p>
            </button>

            <button
              onClick={() => router.push('/progress')}
              className="rounded-lg border-2 border-gray-200 p-6 text-left transition-all hover:border-primary hover:bg-primary/5 dark:border-dark-border dark:hover:border-primary"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                View Progress
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Track your learning journey
              </p>
            </button>

            <button
              onClick={() => router.push('/profile')}
              className="rounded-lg border-2 border-gray-200 p-6 text-left transition-all hover:border-primary hover:bg-primary/5 dark:border-dark-border dark:hover:border-primary"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Settings
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Customize your learning experience
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {stats?.recentSessions && stats.recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border p-3 dark:border-dark-border"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {session.scenarioId}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(session.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {session.metrics && (
                      <p className="font-semibold text-primary">
                        {Math.round(session.metrics.fluencyScore)}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.duration ? `${Math.round(session.duration / 60)}min` : '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
