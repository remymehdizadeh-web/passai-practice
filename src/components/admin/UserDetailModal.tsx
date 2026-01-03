import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Calendar, 
  Target, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Clock,
  Flame
} from 'lucide-react';
import { format } from 'date-fns';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  displayName: string;
}

interface CategoryStats {
  category: string;
  total: number;
  correct: number;
  accuracy: number;
}

export function UserDetailModal({ isOpen, onClose, userId, displayName }: UserDetailModalProps) {
  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['admin-user-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!userId,
  });

  // Fetch user progress stats
  const { data: progressStats, isLoading: progressLoading } = useQuery({
    queryKey: ['admin-user-progress', userId],
    queryFn: async () => {
      // Get all progress for this user by matching session_id patterns
      // Since user_progress uses session_id, we need to get the auth user's progress differently
      // For now, we'll query by the user's session pattern
      const { data, error } = await supabase
        .from('user_progress')
        .select(`
          id,
          is_correct,
          created_at,
          question_id,
          confidence,
          questions!inner(category, difficulty)
        `)
        .order('created_at', { ascending: false })
        .limit(1000);
      
      if (error) throw error;
      
      // Calculate stats
      const total = data?.length ?? 0;
      const correct = data?.filter(d => d.is_correct).length ?? 0;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      
      // Category breakdown
      const categoryMap = new Map<string, { total: number; correct: number }>();
      data?.forEach((d: any) => {
        const category = d.questions?.category ?? 'Unknown';
        const current = categoryMap.get(category) ?? { total: 0, correct: 0 };
        categoryMap.set(category, {
          total: current.total + 1,
          correct: current.correct + (d.is_correct ? 1 : 0),
        });
      });
      
      const categoryStats: CategoryStats[] = Array.from(categoryMap.entries())
        .map(([category, stats]) => ({
          category,
          total: stats.total,
          correct: stats.correct,
          accuracy: Math.round((stats.correct / stats.total) * 100),
        }))
        .sort((a, b) => b.total - a.total);
      
      // Recent activity
      const recentActivity = data?.slice(0, 10) ?? [];
      
      return {
        total,
        correct,
        incorrect: total - correct,
        accuracy,
        categoryStats,
        recentActivity,
      };
    },
    enabled: isOpen && !!userId,
  });

  const isLoading = profileLoading || progressLoading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="block">{displayName}</span>
              <span className="text-sm font-normal text-muted-foreground">User Details</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Profile Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-36" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Joined:</span>
                    <span className="font-medium">
                      {profile?.created_at ? format(new Date(profile.created_at), 'MMM d, yyyy') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Daily Goal:</span>
                    <span className="font-medium">{profile?.study_goal_daily ?? 15} questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Flame className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Streak:</span>
                    <span className="font-medium">{profile?.streak_days ?? 0} days</span>
                  </div>
                  {profile?.exam_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Exam Date:</span>
                      <span className="font-medium">{format(new Date(profile.exam_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{progressStats?.total ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-emerald-500/10">
                    <p className="text-2xl font-bold text-emerald-600">{progressStats?.correct ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Correct</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-rose-500/10">
                    <p className="text-2xl font-bold text-rose-600">{progressStats?.incorrect ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Incorrect</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-primary/10">
                    <p className="text-2xl font-bold text-primary">{progressStats?.accuracy ?? 0}%</p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-8" />
                  ))}
                </div>
              ) : progressStats?.categoryStats?.length ? (
                <div className="space-y-2">
                  {progressStats.categoryStats.slice(0, 6).map((cat) => (
                    <div key={cat.category} className="flex items-center gap-3">
                      <span className="text-sm w-32 truncate">{cat.category}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${cat.accuracy}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{cat.accuracy}%</span>
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        {cat.correct}/{cat.total}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10" />
                  ))}
                </div>
              ) : progressStats?.recentActivity?.length ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {progressStats.recentActivity.map((activity: any) => (
                    <div 
                      key={activity.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                    >
                      {activity.is_correct ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          {activity.questions?.category ?? 'Question'}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {activity.questions?.difficulty ?? 'medium'}
                      </Badge>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {format(new Date(activity.created_at), 'MMM d')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
