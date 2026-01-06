import { useState, useMemo } from "react";
import { useTrackers, useDeleteTracker } from "@/hooks/use-trackers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Trash2, Edit, Clock, Sparkles } from "lucide-react";
import TrackerFormDialog from "@/components/tracker/TrackerFormDialog";
import type { Tracker, TrackerSuggestion } from "@/lib/api";
import { apiClient } from "@/lib/api";

export default function TrackersPage() {
  const { data: trackers = [], isLoading } = useTrackers();
  const deleteTracker = useDeleteTracker();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTracker, setEditingTracker] = useState<Tracker | null>(null);
  const [deletingTracker, setDeletingTracker] = useState<Tracker | null>(null);
  const [suggestions, setSuggestions] = useState<
    Record<string, TrackerSuggestion | null>
  >({});
  const [loadingSuggestions, setLoadingSuggestions] = useState<
    Record<string, boolean>
  >({});
  const [viewingSuggestion, setViewingSuggestion] = useState<{
    trackerId: string;
    problem: string;
  } | null>(null);

  const filteredTrackers = useMemo(() => {
    return trackers.filter((tracker: Tracker) => {
      const matchesSearch = tracker.problem
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || tracker.status === statusFilter;
      const matchesDifficulty =
        difficultyFilter === "all" || tracker.difficulty === difficultyFilter;
      return matchesSearch && matchesStatus && matchesDifficulty;
    });
  }, [trackers, searchQuery, statusFilter, difficultyFilter]);

  const handleDelete = async () => {
    if (!deletingTracker) return;

    try {
      await deleteTracker.mutateAsync(deletingTracker.trackerId);
      setDeletingTracker(null);
    } catch (error) {
      console.error("Failed to delete tracker:", error);
    }
  };

  const handleGetSuggestions = async (trackerId: string, problem: string) => {
    // If already loaded, just show the dialog
    if (suggestions[trackerId]) {
      setViewingSuggestion({ trackerId, problem });
      return;
    }

    setLoadingSuggestions((prev) => ({ ...prev, [trackerId]: true }));
    try {
      const suggestion = await apiClient.getTrackerSuggestion(trackerId);
      setSuggestions((prev) => ({ ...prev, [trackerId]: suggestion }));
      setViewingSuggestion({ trackerId, problem });
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions((prev) => ({ ...prev, [trackerId]: null }));
    } finally {
      setLoadingSuggestions((prev) => ({ ...prev, [trackerId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading trackers...</p>
      </div>
    );
  }

  const currentSuggestion = viewingSuggestion
    ? suggestions[viewingSuggestion.trackerId]
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Problem Trackers
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all your LeetCode problems
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Problem
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter your problems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Solved">Solved</option>
              <option value="Attempted">Attempted</option>
              <option value="To Review">To Review</option>
            </Select>
            <Select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trackers List */}
      {filteredTrackers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              {trackers.length === 0
                ? "No problems tracked yet. Click 'Add Problem' to get started!"
                : "No problems match your filters"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrackers.map((tracker: Tracker) => (
            <Card
              key={tracker.trackerId}
              className="hover:border-primary transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{tracker.problem}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleGetSuggestions(tracker.trackerId, tracker.problem)
                      }
                      disabled={loadingSuggestions[tracker.trackerId]}
                      title="Get AI Suggestions"
                    >
                      <Sparkles
                        className={`h-4 w-4 ${loadingSuggestions[tracker.trackerId] ? "animate-spin" : "text-purple-500"}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingTracker(tracker)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingTracker(tracker)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
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
              </CardHeader>
              <CardContent className="space-y-3">
                {tracker.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {tracker.notes}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{tracker.timeSpent || 0}m</span>
                  </div>
                  <span className="text-muted-foreground">
                    Attempts: {tracker.attempts || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <TrackerFormDialog
        open={isCreateDialogOpen || !!editingTracker}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) setEditingTracker(null);
        }}
        tracker={editingTracker}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingTracker}
        onOpenChange={(open: boolean) => !open && setDeletingTracker(null)}
      >
        <DialogContent onClose={() => setDeletingTracker(null)}>
          <DialogHeader>
            <DialogTitle>Delete Problem</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingTracker?.problem}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeletingTracker(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTracker.isPending}
            >
              {deleteTracker.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Suggestions Dialog */}
      <Dialog
        open={!!viewingSuggestion}
        onOpenChange={(open: boolean) => !open && setViewingSuggestion(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Suggestions for "{viewingSuggestion?.problem}"
            </DialogTitle>
            <DialogDescription>
              Here are some hints and approaches to help you solve this problem
            </DialogDescription>
          </DialogHeader>
          {currentSuggestion ? (
            <div className="space-y-6 mt-4">
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  💡 Hints
                </h4>
                <ul className="space-y-2">
                  {currentSuggestion.hints?.map((hint, i) => (
                    <li key={i} className="text-sm text-muted-foreground pl-4">
                      {i + 1}. {hint}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  🎯 Approaches
                </h4>
                <ul className="space-y-2">
                  {currentSuggestion.approaches?.map((approach, i) => (
                    <li key={i} className="text-sm text-muted-foreground pl-4">
                      {i + 1}. {approach}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  📚 Resources
                </h4>
                <ul className="space-y-2">
                  {currentSuggestion.resources?.map((resource, i) => {
                    // Check if it's a URL
                    const isUrl =
                      resource.startsWith("http://") ||
                      resource.startsWith("https://");
                    return (
                      <li key={i} className="text-sm pl-4">
                        {i + 1}.{" "}
                        {isUrl ? (
                          <a
                            href={resource}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {resource}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">
                            {resource}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Failed to load suggestions. Please try again.
            </div>
          )}
          <div className="flex justify-end mt-6">
            <Button onClick={() => setViewingSuggestion(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
