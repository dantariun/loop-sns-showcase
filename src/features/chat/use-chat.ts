import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repositories } from '@/data';
import { qk } from '@/data/query-keys';
import type { Message } from '@/entities';

export function useThreads() {
  return useQuery({
    queryKey: qk.chat.threads(),
    queryFn: () => repositories.chat.threads(),
  });
}

export function useMessages(threadId: string) {
  return useQuery({
    queryKey: qk.chat.messages(threadId),
    queryFn: () => repositories.chat.messages(threadId),
    enabled: Boolean(threadId),
  });
}

/**
 * 메시지 전송.
 *
 * 채팅은 지연이 보이면 바로 어색해진다. 임시 id 로 말풍선을 먼저 띄우고
 * 응답이 오면 진짜 메시지로 바꾼다.
 */
export function useSendMessage(threadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => repositories.chat.send(threadId, body),

    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: qk.chat.messages(threadId) });
      const previous = queryClient.getQueryData<Message[]>(qk.chat.messages(threadId));

      const optimistic: Message = {
        id: `tmp_${Date.now()}`,
        threadId,
        senderId: 'u_me',
        body,
        sentAt: Date.now(),
        mine: true,
      };
      queryClient.setQueryData<Message[]>(qk.chat.messages(threadId), (old) => [
        ...(old ?? []),
        optimistic,
      ]);

      return { previous, optimisticId: optimistic.id };
    },

    onError: (_err, _body, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qk.chat.messages(threadId), context.previous);
      }
    },

    onSuccess: (sent, _body, context) => {
      queryClient.setQueryData<Message[]>(qk.chat.messages(threadId), (old) =>
        (old ?? []).map((m) => (m.id === context?.optimisticId ? sent : m)),
      );
    },

    // 목록의 마지막 메시지·시각이 바뀐다
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.chat.threads() });
    },
  });
}
