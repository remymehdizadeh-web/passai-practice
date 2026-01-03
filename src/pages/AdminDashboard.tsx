import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDetailModal } from "@/components/admin/UserDetailModal";
import { 
  ArrowLeft, 
  Users, 
  HelpCircle, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  BarChart3,
  Shield,
  ChevronRight
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface DailyActivity {
  date: string;
  answers: number;
  users: number;
}

interface UserWithStats {
  id: string;
  display_name: string | null;
  created_at: string;
  streak_days: number | null;
  exam_date: string | null;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading, user } = useAdmin();
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);

  // Fetch total user count
  const { data: userCount, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-user-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count ?? 0;
    },
    enabled: isAdmin,
  });

  // Fetch total questions count
  const { data: questionCount, isLoading: questionsLoading } = useQuery({
    queryKey: ["admin-question-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      
      if (error) throw error;
      return count ?? 0;
    },
    enabled: isAdmin,
  });

  // Fetch total answers (user_progress entries)
  const { data: totalAnswers, isLoading: answersLoading } = useQuery({
    queryKey: ["admin-total-answers"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count ?? 0;
    },
    enabled: isAdmin,
  });

  // Fetch accuracy rate
  const { data: accuracyRate, isLoading: accuracyLoading } = useQuery({
    queryKey: ["admin-accuracy"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select("is_correct");
      
      if (error) throw error;
      if (!data || data.length === 0) return 0;
      
      const correct = data.filter(d => d.is_correct).length;
      return Math.round((correct / data.length) * 100);
    },
    enabled: isAdmin,
  });

  // Fetch daily activity for last 7 days
  const { data: dailyActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["admin-daily-activity"],
    queryFn: async () => {
      const days: DailyActivity[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date).toISOString();
        const dayEnd = endOfDay(date).toISOString();
        
        const { data, error } = await supabase
          .from("user_progress")
          .select("session_id")
          .gte("created_at", dayStart)
          .lte("created_at", dayEnd);
        
        if (error) throw error;
        
        const uniqueSessions = new Set(data?.map(d => d.session_id) ?? []);
        
        days.push({
          date: format(date, "MMM d"),
          answers: data?.length ?? 0,
          users: uniqueSessions.size,
        });
      }
      
      return days;
    },
    enabled: isAdmin,
  });

  // Fetch recent signups (last 7 days)
  const { data: recentSignups, isLoading: signupsLoading } = useQuery({
    queryKey: ["admin-recent-signups"],
    queryFn: async () => {
      const weekAgo = subDays(new Date(), 7).toISOString();
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo);
      
      if (error) throw error;
      return count ?? 0;
    },
    enabled: isAdmin,
  });

  // Fetch all users with basic info
  const { data: allUsers, isLoading: usersListLoading } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, created_at, streak_days, exam_date")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as UserWithStats[];
    },
    enabled: isAdmin,
  });

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
        <p className="text-muted-foreground mb-4">Please sign in to access the admin dashboard.</p>
        <Button onClick={() => navigate("/auth")}>Sign In</Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <Shield className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-4">You don't have permission to view this page.</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const isLoading = usersLoading || questionsLoading || answersLoading || accuracyLoading;

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">App statistics and user metrics</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-3xl font-bold">{userCount?.toLocaleString()}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-3xl font-bold">{questionCount?.toLocaleString()}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Total Answers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-3xl font-bold">{totalAnswers?.toLocaleString()}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-3xl font-bold">{accuracyRate}%</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Signups */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              New Users (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {signupsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold text-primary">{recentSignups}</p>
            )}
          </CardContent>
        </Card>

        {/* User List */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              All Users (Click to view details)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersListLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {allUsers?.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser({ id: u.id, name: u.display_name || 'Unknown' })}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {(u.display_name || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.display_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {format(new Date(u.created_at), 'MMM d, yyyy')}
                        {u.streak_days ? ` • ${u.streak_days} day streak` : ''}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Daily Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {dailyActivity?.map((day) => (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-12">{day.date}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (day.answers / Math.max(...(dailyActivity?.map(d => d.answers) ?? [1]))) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">{day.answers} ans</span>
                    <span className="text-sm text-muted-foreground w-16 text-right">{day.users} users</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <Button variant="outline" onClick={() => navigate("/admin/questions")}>
            Import Questions
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/generate")}>
            Generate Questions
          </Button>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          userId={selectedUser.id}
          displayName={selectedUser.name}
        />
      )}
    </div>
  );
}
