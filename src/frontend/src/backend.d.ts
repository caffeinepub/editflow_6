import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface DocumentVersion {
    versionId: bigint;
    content: string;
    savedAt: Time;
    documentId: DocumentId;
}
export interface Folder {
    id: FolderId;
    owner: Principal;
    name: string;
    createdAt: Time;
}
export type DocumentId = bigint;
export interface Document {
    id: DocumentId;
    title: string;
    content: string;
    owner: Principal;
    createdAt: Time;
    updatedAt: Time;
    folderId?: FolderId;
}
export interface UserProfile {
    name: string;
    hasSeenSampleData: boolean;
}
export type FolderId = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createDocument(title: string, content: string): Promise<DocumentId>;
    createFolder(name: string): Promise<FolderId>;
    deleteDocument(documentId: DocumentId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDocument(documentId: DocumentId): Promise<Document>;
    getDocumentHistory(documentId: DocumentId): Promise<Array<DocumentVersion>>;
    getUserDocuments(): Promise<Array<Document>>;
    getUserFolders(): Promise<Array<Folder>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    moveDocumentToFolder(documentId: DocumentId, folderId: FolderId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchDocumentsByTitle(searchTerm: string): Promise<Array<Document>>;
    updateDocument(documentId: DocumentId, title: string, content: string): Promise<void>;
}
