import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Review {
    comment?: string;
    swapRequestId: bigint;
    rating: bigint;
    reviewee: Principal;
    reviewer: Principal;
}
export interface Skill {
    name: string;
}
export interface UserProfile {
    skillsOffered: Array<Skill>;
    name: string;
    email: string;
    averageRating: number;
    location: string;
    skillsWanted: Array<Skill>;
}
export interface SwapRequest {
    id: bigint;
    to: Principal;
    status: Variant_pending_completed_rejected_accepted;
    sessionTime?: bigint;
    from: Principal;
    skillWanted: string;
    skillOffered: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_completed_rejected_accepted {
    pending = "pending",
    completed = "completed",
    rejected = "rejected",
    accepted = "accepted"
}
export interface backendInterface {
    acceptSwapRequest(requestId: bigint, sessionTime: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    findMatches(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMySwapRequests(): Promise<Array<SwapRequest>>;
    getProfile(userId: Principal): Promise<UserProfile>;
    getReviewsForUser(userId: Principal): Promise<Array<Review>>;
    getSwapRequestStatus(requestId: bigint): Promise<Variant_pending_completed_rejected_accepted>;
    getUserProfile(userId: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listUsers(offset: bigint, limit: bigint): Promise<Array<UserProfile>>;
    markSwapComplete(requestId: bigint): Promise<void>;
    rejectSwapRequest(requestId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUsersBySkill(skillName: string): Promise<Array<UserProfile>>;
    sendSwapRequest(to: Principal, skillOffered: string, skillWanted: string): Promise<bigint>;
    submitReview(swapRequestId: bigint, rating: bigint, comment: string | null): Promise<void>;
    updateProfile(name: string, email: string, location: string, skillsOffered: Array<Skill>, skillsWanted: Array<Skill>): Promise<void>;
}
