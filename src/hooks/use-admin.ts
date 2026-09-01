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
      mutationFn: (input: string | { id: string; mallId?: string }) => {
        if (typeof input === "string") return adminApi.approveStore(input);
        return adminApi.approveStore(input.id, input.mallId);
      },
      onSuccess: invalidate,
    }),
    reject: useMutation({
      mutationFn: (input: string | { id: string; reason?: string }) => {
        if (typeof input === "string") return adminApi.rejectStore(input);
        return adminApi.rejectStore(input.id, input.reason);
      },
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

export function useAdminReturns(filters: { status?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.returns(filters),
    queryFn: () => adminApi.returns({ ...filters, limit: 50 }),
  });
}

export function useAdminReturnAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      note,
    }: {
      id: string;
      action: "approve" | "reject";
      note?: string;
    }) => adminApi.updateReturn(id, action, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.returns() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
    },
  });
}

export function useAdminVerification() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.verification(),
    queryFn: adminApi.verification,
  });
}

export function useAdminMall(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.mall(id),
    queryFn: () => adminApi.mall(id),
    enabled: Boolean(id),
  });
}

export function useRejectRider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => adminApi.rejectRider(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.all }),
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.settings(),
    queryFn: adminApi.settings,
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.settings() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.commission() });
    },
  });
}

export function useAdminLedger(filters: { type?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.ledger(filters),
    queryFn: () => adminApi.ledger({ ...filters, limit: 50 }),
  });
}

export function useAdminTrustReports(filters: { status?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.trustReports(filters),
    queryFn: () => adminApi.trustReports({ ...filters, limit: 30 }),
  });
}

export function useUpdateTrustReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      admin_note,
    }: {
      id: string;
      status: string;
      admin_note?: string;
    }) => adminApi.updateTrustReport(id, { status, admin_note }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.trustReports() }),
  });
}

export function useAdminDisputes(filters: { status?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.disputes(filters),
    queryFn: () => adminApi.disputes({ ...filters, limit: 30 }),
  });
}

export function useUpdateDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      action: "review" | "resolve";
      resolution?: string;
      admin_note?: string;
      refund_amount?: number;
    }) => adminApi.updateDispute(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.disputes() }),
  });
}

export function useAdminModeration() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.moderation(),
    queryFn: adminApi.moderationQueue,
  });
}

export function useAdminProductModerationActions() {
  const queryClient = useQueryClient();
  return {
    approve: useMutation({
      mutationFn: (id: string) => adminApi.approveProduct(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.moderation() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.products() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
      },
    }),
    reject: useMutation({
      mutationFn: ({ id, note }: { id: string; note?: string }) => adminApi.rejectProduct(id, note),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.moderation() }),
    }),
  };
}

export function useAdminWebhooks(filters: { status?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.webhooks(filters),
    queryFn: () => adminApi.webhooks({ ...filters, limit: 50 }),
  });
}

export function useAdminWebhookReconciliation() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.webhookReconciliation(),
    queryFn: adminApi.webhookReconciliation,
  });
}

export function useAdminChargebacks(filters: { status?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.chargebacks(filters),
    queryFn: () => adminApi.chargebacks({ ...filters, limit: 30 }),
  });
}

export function useRecordChargeback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.recordChargeback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.chargebacks() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.ledger() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.payments() });
    },
  });
}

export function useUpdateChargeback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; status: "won" | "lost"; admin_note?: string }) =>
      adminApi.updateChargeback(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.chargebacks() }),
  });
}

export function useAdminDeliveryZones() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.deliveryZones(),
    queryFn: adminApi.deliveryZones,
  });
}

export function useAdminDeliveryZoneActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.deliveryZones() });
  return {
    create: useMutation({
      mutationFn: adminApi.createDeliveryZone,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({
        id,
        ...payload
      }: {
        id: string;
        name?: string;
        state?: string | null;
        city?: string | null;
        fee?: number;
        free_above?: number | null;
        eta_min_days?: number;
        eta_max_days?: number;
        is_active?: boolean;
      }) => adminApi.updateDeliveryZone(id, payload),
      onSuccess: invalidate,
    }),
  };
}

export function useAdminPromoCodes() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.promoCodes(),
    queryFn: adminApi.promoCodes,
  });
}

export function useAdminPromoCodeActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.promoCodes() });
  return {
    create: useMutation({
      mutationFn: adminApi.createPromoCode,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, ...payload }: { id: string; is_active?: boolean; value?: number }) =>
        adminApi.updatePromoCode(id, payload),
      onSuccess: invalidate,
    }),
  };
}
