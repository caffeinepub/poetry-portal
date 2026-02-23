import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Poem, CollectionView, PoemSearchResult, ExternalBlob, UserProfile, Notification } from '../backend';
import { PoemType } from '../backend';

export function useGetAllPoems() {
  const { actor, isFetching } = useActor();

  return useQuery<Poem[]>({
    queryKey: ['poems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPoems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPoemById(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Poem>({
    queryKey: ['poem', id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getPoemById(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitPoem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      content,
      author,
      poemType,
      imageUrl,
    }: {
      title: string;
      content: string;
      author: string;
      poemType: PoemType;
      imageUrl: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.submitPoem(title, content, author, poemType, imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poems'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useGetAllCollections() {
  const { actor, isFetching } = useActor();

  return useQuery<CollectionView[]>({
    queryKey: ['collections'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCollections();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPoemsByCollectionId(collectionId: bigint, enabled: boolean = true) {
  const { actor, isFetching } = useActor();

  return useQuery<Poem[]>({
    queryKey: ['collection-poems', collectionId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPoemsByCollectionId(collectionId);
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useCreateCollection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createCollection(name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useAddPoemToCollection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ collectionId, poemId }: { collectionId: bigint; poemId: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addPoemToCollection(collectionId, poemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection-poems'] });
    },
  });
}

export function useRemovePoemFromCollection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ collectionId, poemId }: { collectionId: bigint; poemId: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.removePoemFromCollection(collectionId, poemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection-poems'] });
    },
  });
}

export function useDeleteCollection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collectionId: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteCollection(collectionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useSearchPoems(searchTerm: string, enabled: boolean = true) {
  const { actor, isFetching } = useActor();

  return useQuery<PoemSearchResult[]>({
    queryKey: ['search-poems', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchPoems(searchTerm);
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useGetCollectionsForPoem(poemId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<CollectionView[]>({
    queryKey: ['poem-collections', poemId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const allCollections = await actor.getAllCollections();
      return allCollections.filter((collection) =>
        collection.poemIds.some((id) => id === poemId)
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetNotifications() {
  const { actor, isFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUnreadNotificationsCount() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['unreadNotificationsCount'],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getUnreadNotificationsCount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (index: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.markNotificationAsRead(index);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });
}
