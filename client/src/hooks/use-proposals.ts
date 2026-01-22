import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertProposal } from "@shared/routes";
import { MOCK_PROPOSALS } from "@/mock/data";

export function useProposals() {
  return useQuery({
    queryKey: [api.proposals.list.path],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return MOCK_PROPOSALS;
    },
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertProposal) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app: POST to api.proposals.create.path
      console.log("Creating proposal:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.proposals.list.path] });
    },
  });
}
