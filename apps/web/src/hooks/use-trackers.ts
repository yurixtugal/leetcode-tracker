import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  type Tracker,
  type CreateTrackerDTO,
  type UpdateTrackerDTO,
} from "@/lib/api";

// Query keys factory
export const trackerKeys = {
  all: ["trackers"] as const,
  lists: () => [...trackerKeys.all, "list"] as const,
  list: (filters?: string) => [...trackerKeys.lists(), { filters }] as const,
  details: () => [...trackerKeys.all, "detail"] as const,
  detail: (id: string) => [...trackerKeys.details(), id] as const,
};

// Fetch all trackers
export function useTrackers() {
  return useQuery({
    queryKey: trackerKeys.lists(),
    queryFn: () => apiClient.getTrackers(),
  });
}

// Fetch single tracker
export function useTracker(id: string) {
  return useQuery({
    queryKey: trackerKeys.detail(id),
    queryFn: () => apiClient.getTracker(id),
    enabled: !!id,
  });
}

// Create tracker mutation
export function useCreateTracker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTrackerDTO) => apiClient.createTracker(data),
    onMutate: async (newTracker) => {
      await queryClient.cancelQueries({ queryKey: trackerKeys.lists() });
      const previousTrackers = queryClient.getQueryData<Tracker[]>(
        trackerKeys.lists(),
      );

      // Optimistically update the cache
      if (previousTrackers) {
        queryClient.setQueryData<Tracker[]>(trackerKeys.lists(), (old = []) => [
          ...old,
          {
            ...newTracker,
            trackerId: "temp",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            PK: "",
            SK: "",
          } as Tracker,
        ]);
      }

      return { previousTrackers };
    },
    onError: (_err, _newTracker, context) => {
      if (context?.previousTrackers) {
        queryClient.setQueryData(trackerKeys.lists(), context.previousTrackers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: trackerKeys.lists() });
    },
  });
}

// Update tracker mutation
export function useUpdateTracker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTrackerDTO }) =>
      apiClient.updateTracker(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: trackerKeys.detail(id) });
      const previousTracker = queryClient.getQueryData<Tracker>(
        trackerKeys.detail(id),
      );

      if (previousTracker) {
        queryClient.setQueryData<Tracker>(trackerKeys.detail(id), {
          ...previousTracker,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousTracker };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousTracker) {
        queryClient.setQueryData(
          trackerKeys.detail(id),
          context.previousTracker,
        );
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: trackerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: trackerKeys.lists() });
    },
  });
}

// Delete tracker mutation
export function useDeleteTracker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTracker(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: trackerKeys.lists() });
      const previousTrackers = queryClient.getQueryData<Tracker[]>(
        trackerKeys.lists(),
      );

      if (previousTrackers) {
        queryClient.setQueryData<Tracker[]>(
          trackerKeys.lists(),
          previousTrackers.filter((t) => t.trackerId !== id),
        );
      }

      return { previousTrackers };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTrackers) {
        queryClient.setQueryData(trackerKeys.lists(), context.previousTrackers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: trackerKeys.lists() });
    },
  });
}
