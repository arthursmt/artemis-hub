import { useQuery } from "@tanstack/react-query";
import { masterKpis } from "@/mock/data";

export function useKpis() {
  return useQuery({
    queryKey: ["/api/kpis"],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return masterKpis;
    },
  });
}
