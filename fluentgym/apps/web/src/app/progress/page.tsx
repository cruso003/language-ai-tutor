'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { apiClient } from '@/lib/api-client';
import { Session } from '@/types';
import { formatDate } from '@/lib/utils';
import { TrendingUp, Clock, Award, Calendar } from 'lucide-react';

export default function ProgressPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await apiClient.getSessions({ limit: 50 });
        setSessions(data.sessions || []);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-lg">Loading your progress...</div>
      </div>
    );
  }

  const completedSessions = sessions.filter((s) => s.endedAt);
  const totalMinutes = completedSessions.reduce(
    (acc, s) => acc + (s.duration ? s.duration / 60 : 0),
    0
  );
  const avgFluency =
    completedSessions.length > 0
      ? completedSessions.reduce((acc, s) => acc + (s.metrics?.fluencyScore || 0), 0) /
        completedSessions.length
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Progress</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Track your learning journey and improvements
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Sessions
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {completedSessions.length}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
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
                  {Math.round(totalMinutes)}
                </p>
                <p className="text-xs text-gray-500">minutes</p>
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
                  {Math.round(avgFluency)}
                </p>
                <p className="text-xs text-gray-500">out of 100</p>
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
          <CardTitle>Session History</CardTitle>
        </CardHeader>
        <CardContent>
          {completedSessions.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              <p>No completed sessions yet.</p>
              <p className="mt-1 text-sm">Start practicing to see your progress!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border p-4 dark:border-dark-border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {session.scenarioId}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(session.startedAt)}
                        </p>
                      </div>
                      {session.metrics && (
                        <div className="flex gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-semibold text-primary">
                              {Math.round(session.metrics.fluencyScore)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Fluency
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {session.duration
                                ? `${Math.round(session.duration / 60)}m`
                                : '-'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Duration
                            </p>
                          </div>
                          {session.metrics.vocabularyVariety > 0 && (
                            <div className="text-center">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {session.metrics.vocabularyVariety}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                Vocab
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
