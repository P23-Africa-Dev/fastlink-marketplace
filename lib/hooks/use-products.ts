import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Product } from "@/types";

export function useProducts(filters?: { category?: string; vendorId?: string }) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      let endpoint = "products";
      const params = new URLSearchParams();
      if (filters?.category) params.append("category", filters.category);
      if (filters?.vendorId) params.append("vendorId", filters.vendorId);
      
      const queryStr = params.toString();
      if (queryStr) {
        endpoint += `?${queryStr}`;
      }
      return api.get<Product[]>(endpoint);
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => api.get<Product>(`products/${id}`),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newProduct: Partial<Product>) =>
      api.post<Product>("products", newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Product>) =>
      api.put<Product>(`products/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
