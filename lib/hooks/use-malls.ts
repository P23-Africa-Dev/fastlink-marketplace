import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Mall } from "@/types";

export function useMalls() {
  return useQuery({
    queryKey: ["malls"],
    queryFn: () => api.get<Mall[]>("malls"),
  });
}

export function useMall(id: string) {
  return useQuery({
    queryKey: ["mall", id],
    queryFn: () => api.get<Mall>(`malls/${id}`),
    enabled: !!id,
  });
}
