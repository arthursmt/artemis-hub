import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { MOCK_CONTRACTS } from "@/mock/data";

export function useContracts() {
  return useQuery({
    queryKey: [api.contracts.list.path],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return MOCK_CONTRACTS;
    },
  });
}
