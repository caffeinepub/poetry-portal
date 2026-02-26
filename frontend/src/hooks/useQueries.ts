import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Poem, PoemSubmission, UserProfile, CollectionView } from '../backend';

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
      if (!actor) throw new Error('Actor not available');
      return actor.getPoemById(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchPoems(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['poems', 'search', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchPoems(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
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

export function useGetPoemsByCollectionId(collectionId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Poem[]>({
    queryKey: ['poems', 'collection', collectionId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPoemsByCollectionId(collectionId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitPoem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (submission: PoemSubmission) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitPoemWithCollections(submission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poems'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useUpdatePoem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ poemId, poem }: { poemId: bigint; poem: Poem }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePoem(poemId, poem);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['poems'] });
      queryClient.invalidateQueries({ queryKey: ['poem', variables.poemId.toString()] });
    },
  });
}

export function useDeletePoem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (poemId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePoem(poemId);
    },
    onSuccess: (_data, poemId) => {
      queryClient.invalidateQueries({ queryKey: ['poems'] });
      queryClient.invalidateQueries({ queryKey: ['poem', poemId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useCreateCollection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCollection(name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useDeleteCollection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (collectionId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCollection(collectionId);
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
      if (!actor) throw new Error('Actor not available');
      return actor.addPoemToCollection(collectionId, poemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['poems'] });
    },
  });
}

export function useRemovePoemFromCollection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ collectionId, poemId }: { collectionId: bigint; poemId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removePoemFromCollection(collectionId, poemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['poems'] });
    },
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
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery({
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
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getUnreadNotificationsCount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (index: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markNotificationAsRead(index);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetIsDraftModeEnabled() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isDraftModeEnabled'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getIsDraftModeEnabled();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePublishToProduction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.publishToProduction();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isDraftModeEnabled'] });
    },
  });
}
