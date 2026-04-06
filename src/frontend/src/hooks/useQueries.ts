import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Document, DocumentId, DocumentVersion, Folder } from "../backend";
import { useActor } from "./useActor";

export function useGetUserDocuments() {
  const { actor, isFetching } = useActor();
  return useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserDocuments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDocument(documentId: DocumentId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Document | null>({
    queryKey: ["document", documentId?.toString()],
    queryFn: async () => {
      if (!actor || documentId === null) return null;
      return actor.getDocument(documentId);
    },
    enabled: !!actor && !isFetching && documentId !== null,
  });
}

export function useGetUserFolders() {
  const { actor, isFetching } = useActor();
  return useQuery<Folder[]>({
    queryKey: ["folders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserFolders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDocumentHistory(documentId: DocumentId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<DocumentVersion[]>({
    queryKey: ["history", documentId?.toString()],
    queryFn: async () => {
      if (!actor || documentId === null) return [];
      return actor.getDocumentHistory(documentId);
    },
    enabled: !!actor && !isFetching && documentId !== null,
  });
}

export function useSearchDocuments(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Document[]>({
    queryKey: ["search", searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      return actor.searchDocumentsByTitle(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.trim().length > 0,
  });
}

export function useCreateDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
    }: { title: string; content: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createDocument(title, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useUpdateDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
    }: {
      id: DocumentId;
      title: string;
      content: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateDocument(id, title, content);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({
        queryKey: ["document", variables.id.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["history", variables.id.toString()],
      });
    },
  });
}

export function useDeleteDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (documentId: DocumentId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteDocument(documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useCreateFolder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createFolder(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}
