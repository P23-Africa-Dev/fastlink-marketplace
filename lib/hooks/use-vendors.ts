import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Vendor } from "@/types";

export function useVendors() {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: () => api.get<Vendor[]>("vendors"),
  });
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: ["vendor", id],
    queryFn: () => api.get<Vendor>(`vendors/${id}`),
    enabled: !!id,
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Vendor>) =>
      api.put<Vendor>(`vendors/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendor", variables.id] });
    },
  });
}
