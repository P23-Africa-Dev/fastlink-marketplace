"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";

export function useAdminOverview() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.overview(),
    queryFn: adminApi.overview,
  });
}

export function useAdminUsers(filters: { q?: string; role?: string; status?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.users(filters),
    queryFn: () => adminApi.users({ ...filters, limit: 50 }),
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateUser(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.all }),
  });
}

export function useAdminStores(filters: { q?: string; status?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.stores(filters),
    queryFn: () => adminApi.stores({ ...filters, limit: 50 }),
  });
}

export function useAdminStoreActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.all });

  return {
    approve: useMutation({
      mutationFn: (id: string) => adminApi.approveStore(id),
      onSuccess: invalidate,
    }),
    reject: useMutation({
      mutationFn: (id: string) => adminApi.rejectStore(id),
      onSuccess: invalidate,
    }),
    suspend: useMutation({
      mutationFn: (id: string) => adminApi.suspendStore(id),
      onSuccess: invalidate,
    }),
  };
}

export function useAdminProducts(filters: { q?: string; status?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.products(filters),
    queryFn: () => adminApi.products({ ...filters, limit: 50 }),
  });
}

export function useUnpublishProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.unpublishProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}

export function useAdminOrders(filters: { q?: string; status?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.orders(filters),
    queryFn: () => adminApi.orders({ ...filters, limit: 50 }),
  });
}

export function useAdminPayments(filters: { q?: string; status?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.payments(filters),
    queryFn: () => adminApi.payments({ ...filters, limit: 50 }),
  });
}

export function useAdminPayouts(filters: { status?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.payouts(filters),
    queryFn: () => adminApi.payouts({ ...filters, limit: 50 }),
  });
}

export function useAdminPayoutActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.all });

  return {
    approve: useMutation({
      mutationFn: (id: string) => adminApi.approvePayout(id),
      onSuccess: invalidate,
    }),
    reject: useMutation({
      mutationFn: (id: string) => adminApi.rejectPayout(id),
      onSuccess: invalidate,
    }),
  };
}

export function useAdminCommission() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.commission(),
    queryFn: adminApi.commission,
  });
}

export function useUpdateCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rate: number) => adminApi.updateCommission(rate),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.commission() }),
  });
}

export function useAdminCatalog() {
  const malls = useQuery({ queryKey: QUERY_KEYS.admin.malls(), queryFn: adminApi.malls });
  const categories = useQuery({ queryKey: QUERY_KEYS.admin.categories(), queryFn: adminApi.categories });
  const brands = useQuery({ queryKey: QUERY_KEYS.admin.brands(), queryFn: adminApi.brands });
  return { malls, categories, brands };
}

export function useAdminAudit(filters: { q?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.audit(filters),
    queryFn: () => adminApi.auditLogs({ ...filters, limit: 50 }),
  });
}

export function useAdminTickets(filters: { q?: string; status?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.tickets(),
    queryFn: () => adminApi.tickets({ ...filters, limit: 50 }),
  });
}

export function useAdminTicket(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.admin.tickets(), id],
    queryFn: () => adminApi.ticket(id!),
    enabled: Boolean(id),
  });
}

export function useAdminTicketActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.tickets() });
  return {
    reply: useMutation({
      mutationFn: ({ id, body }: { id: string; body: string }) => adminApi.replyTicket(id, body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateTicket(id, { status }),
      onSuccess: invalidate,
    }),
  };
}

export function useAdminRiders(filters: { status?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.riders(filters),
    queryFn: () => adminApi.riders({ ...filters, limit: 50 }),
  });
}

export function useApproveRider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.approveRider,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.all }),
  });
}

export function useAssignRider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, riderId }: { orderId: string; riderId: string }) =>
      adminApi.assignRider(orderId, riderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.all }),
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.analytics(),
    queryFn: adminApi.analytics,
  });
}
