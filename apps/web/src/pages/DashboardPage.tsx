import { useMemo } from "react";
import { useTrackers } from "@/hooks/use-trackers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Target, Clock, TrendingUp } from "lucide-react";
import type { Tracker } from "@/lib/api";

export default function DashboardPage() {
  const { data: trackers = [], isLoading } = useTrackers();

  const stats = useMemo(() => {
    const solved = trackers.filter((t) => t.status === "Solved").length;
    const attempted = trackers.filter((t) => t.status === "Attempted").length;
    const toReview = trackers.filter((t) => t.status === "To Review").length;

    const byDifficulty = {
      easy: trackers.filter((t) => t.difficulty === "Easy").length,
      medium: trackers.filter((t) => t.difficulty === "Medium").length,
      hard: trackers.filter((t) => t.difficulty === "Hard").length,
    };

    const totalTime = trackers.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
    const avgTime =
      trackers.length > 0 ? Math.round(totalTime / trackers.length) : 0;

    return {
      total: trackers.length,
      solved,
      attempted,
      toReview,
      byDifficulty,
      totalTime,
      avgTime,
    };
  }, [trackers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your LeetCode progress and statistics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Problems
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All tracked problems
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.solved}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? Math.round((stats.solved / stats.total) * 100)
                : 0}
              % completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTime}m</div>
            <p className="text-xs text-muted-foreground">Per problem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attempted}</div>
            <p className="text-xs text-muted-foreground">
              Currently working on
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Problems by current status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="success">Solved</Badge>
              </div>
              <span className="text-2xl font-semibold">{stats.solved}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Attempted</Badge>
              </div>
              <span className="text-2xl font-semibold">{stats.attempted}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">To Review</Badge>
              </div>
              <span className="text-2xl font-semibold">{stats.toReview}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Difficulty Distribution</CardTitle>
            <CardDescription>Problems by difficulty level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="success">Easy</Badge>
              </div>
              <span className="text-2xl font-semibold">
                {stats.byDifficulty.easy}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Medium</Badge>
              </div>
              <span className="text-2xl font-semibold">
                {stats.byDifficulty.medium}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Hard</Badge>
              </div>
              <span className="text-2xl font-semibold">
                {stats.byDifficulty.hard}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Problems</CardTitle>
          <CardDescription>Your latest tracked problems</CardDescription>
        </CardHeader>
        <CardContent>
          {trackers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No problems tracked yet. Start by adding your first problem!
            </p>
          ) : (
            <div className="space-y-4">
              {trackers.slice(0, 5).map((tracker: Tracker) => (
                <div
                  key={tracker.trackerId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{tracker.problem}</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          tracker.difficulty === "Easy"
                            ? "success"
                            : tracker.difficulty === "Medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {tracker.difficulty}
                      </Badge>
                      <Badge
                        variant={
                          tracker.status === "Solved"
                            ? "success"
                            : tracker.status === "Attempted"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {tracker.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {tracker.timeSpent
                      ? `${tracker.timeSpent}m`
                      : "No time recorded"}
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
