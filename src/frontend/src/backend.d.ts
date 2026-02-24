import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface CollectionView {
    id: bigint;
    poemIds: Array<bigint>;
    dateCreated: Time;
    name: string;
    description: string;
}
export interface PoemSubmission {
    title: string;
    content: string;
    collectionIds: Array<bigint>;
    poemType: PoemType;
    author: string;
    imageUrl?: ExternalBlob;
}
export type Time = bigint;
export interface PoemSearchResult {
    poem: Poem;
    collectionNames: Array<string>;
}
export interface Notification {
    read: boolean;
    message: string;
    timestamp: Time;
}
export interface Poem {
    id: bigint;
    title: string;
    content: string;
    dateCreated: Time;
    poemType: PoemType;
    author: string;
    imageUrl?: ExternalBlob;
}
export interface UserProfile {
    name: string;
}
export enum PoemType {
    text = "text",
    image = "image"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPoemToCollection(collectionId: bigint, poemId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCollection(name: string, description: string): Promise<bigint>;
    deleteCollection(collectionId: bigint): Promise<void>;
    getAllCollections(): Promise<Array<CollectionView>>;
    getAllPoems(): Promise<Array<Poem>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getIsDraftModeEnabled(): Promise<boolean>;
    getNotifications(): Promise<Array<Notification>>;
    getPoemById(id: bigint): Promise<Poem>;
    getPoemsByCollectionId(collectionId: bigint): Promise<Array<Poem>>;
    getUnreadNotificationsCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVersion(): Promise<[bigint, bigint, bigint]>;
    isCallerAdmin(): Promise<boolean>;
    markNotificationAsRead(index: bigint): Promise<void>;
    publishToProduction(): Promise<void>;
    removePoemFromCollection(collectionId: bigint, poemId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchPoems(searchTerm: string): Promise<Array<PoemSearchResult>>;
    setDraftMode(enabled: boolean): Promise<void>;
    submitPoem(title: string, content: string, author: string, poemType: PoemType, imageUrl: ExternalBlob | null): Promise<bigint>;
    submitPoemWithCollections(submission: PoemSubmission): Promise<bigint>;
    updatePoem(poemId: bigint, newPoem: Poem): Promise<void>;
}
