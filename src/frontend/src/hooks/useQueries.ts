import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Poem } from '../backend';

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
    }: {
      title: string;
      content: string;
      author: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.submitPoem(title, content, author);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poems'] });
    },
  });
}
