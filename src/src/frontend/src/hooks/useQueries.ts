import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type {
  UserProfile,
  SwapRequest,
  Review,
  Skill,
  Variant_pending_completed_rejected_accepted,
} from "../backend";
import { Principal } from "@icp-sdk/core/principal";

// ===========================
// User Profile Queries
// ===========================

export function useGetCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserProfile(userId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserProfile(Principal.fromText(userId));
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useListUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listUsers(BigInt(0), BigInt(100)); // Fetch first 100 users
    },
    enabled: !!actor && !isFetching,
  });
}

// ===========================
// Skill Matching Queries
// ===========================

export function useFindMatches() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["matches"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.findMatches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchUsersBySkill(skillName: string) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["searchUsers", skillName],
    queryFn: async () => {
      if (!actor || !skillName) return [];
      return actor.searchUsersBySkill(skillName);
    },
    enabled: !!actor && !isFetching && !!skillName,
  });
}

// ===========================
// Swap Request Queries
// ===========================

export function useGetMySwapRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<SwapRequest[]>({
    queryKey: ["mySwapRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMySwapRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

// ===========================
// Review Queries
// ===========================

export function useGetReviewsForUser(userId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["reviews", userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getReviewsForUser(Principal.fromText(userId));
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

// ===========================
// Profile Mutations
// ===========================

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      email,
      location,
      skillsOffered,
      skillsWanted,
    }: {
      name: string;
      email: string;
      location: string;
      skillsOffered: Skill[];
      skillsWanted: Skill[];
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updateProfile(
        name,
        email,
        location,
        skillsOffered,
        skillsWanted
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

// ===========================
// Swap Request Mutations
// ===========================

export function useSendSwapRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      to,
      skillOffered,
      skillWanted,
    }: {
      to: string;
      skillOffered: string;
      skillWanted: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.sendSwapRequest(
        Principal.fromText(to),
        skillOffered,
        skillWanted
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySwapRequests"] });
    },
  });
}

export function useAcceptSwapRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      sessionTime,
    }: {
      requestId: bigint;
      sessionTime: bigint;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.acceptSwapRequest(requestId, sessionTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySwapRequests"] });
    },
  });
}

export function useRejectSwapRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.rejectSwapRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySwapRequests"] });
    },
  });
}

export function useMarkSwapComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.markSwapComplete(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySwapRequests"] });
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

// ===========================
// Review Mutations
// ===========================

export function useSubmitReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      swapRequestId,
      rating,
      comment,
    }: {
      swapRequestId: bigint;
      rating: bigint;
      comment: string | null;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.submitReview(swapRequestId, rating, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}
