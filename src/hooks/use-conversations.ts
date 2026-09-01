"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { conversationsApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";

export function useConversations() {
  return useQuery({
    queryKey: QUERY_KEYS.conversations.list(),
    queryFn: () => conversationsApi.list({ limit: 50 }),
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.conversations.detail(id),
    queryFn: () => conversationsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: conversationsApi.start,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all }),
  });
}

export function useReplyConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => conversationsApi.reply(id, body),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.detail(vars.id) });
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => conversationsApi.update(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all }),
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: conversationsApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all }),
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: conversationsApi.read,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all }),
  });
}
