import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateTracker, useUpdateTracker } from "@/hooks/use-trackers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { CreateTrackerDTO, Tracker } from "@/lib/api";

interface TrackerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracker?: Tracker | null;
}

export default function TrackerFormDialog({
  open,
  onOpenChange,
  tracker,
}: TrackerFormDialogProps) {
  const isEditing = !!tracker;
  const createTracker = useCreateTracker();
  const updateTracker = useUpdateTracker();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTrackerDTO>({
    defaultValues: {
      problem: "",
      difficulty: "Easy",
      status: "Attempted",
      notes: "",
      attempts: 0,
      timeSpent: 0,
    },
  });

  useEffect(() => {
    if (tracker) {
      reset({
        problem: tracker.problem,
        difficulty: tracker.difficulty,
        status: tracker.status,
        notes: tracker.notes || "",
        attempts: tracker.attempts || 0,
        timeSpent: tracker.timeSpent || 0,
      });
    } else {
      reset({
        problem: "",
        difficulty: "Easy",
        status: "Attempted",
        notes: "",
        attempts: 0,
        timeSpent: 0,
      });
    }
  }, [tracker, reset]);

  const onSubmit = async (data: CreateTrackerDTO) => {
    try {
      if (isEditing) {
        await updateTracker.mutateAsync({ id: tracker.trackerId, data });
      } else {
        await createTracker.mutateAsync(data);
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Failed to save tracker:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Problem" : "Add New Problem"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the problem details"
              : "Track a new LeetCode problem"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="problem">Problem Name</Label>
            <Input
              id="problem"
              {...register("problem", { required: "Problem name is required" })}
              placeholder="e.g., Two Sum"
            />
            {errors.problem && (
              <p className="text-sm text-destructive">
                {errors.problem.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                id="difficulty"
                {...register("difficulty", { required: true })}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...register("status", { required: true })}>
                <option value="Solved">Solved</option>
                <option value="Attempted">Attempted</option>
                <option value="To Review">To Review</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="attempts">Attempts</Label>
              <Input
                id="attempts"
                type="number"
                min="0"
                {...register("attempts", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeSpent">Time Spent (minutes)</Label>
              <Input
                id="timeSpent"
                type="number"
                min="0"
                {...register("timeSpent", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Add your notes, approach, or key learnings..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
