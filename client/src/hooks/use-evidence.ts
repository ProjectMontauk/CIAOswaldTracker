import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Evidence, User, Vote } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

type EvidenceSubmission = {
  title: string;
  content: string;
  text: string;
  marketId?: number;
};

type EvidenceWithRelations = Evidence & {
  user?: User;
  votes?: Vote[];
};

export function useEvidence(marketId?: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: evidence = [], isLoading } = useQuery<EvidenceWithRelations[]>({
    queryKey: ['/api/markets', marketId, 'evidence'],
    queryFn: async () => {
      if (!marketId) return [];
      const response = await fetch(`/api/markets/${marketId}/evidence`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    enabled: !!marketId,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: EvidenceSubmission) => {
      const res = await fetch('/api/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/markets', marketId, 'evidence'] });
      toast({
        title: "Success",
        description: "Evidence submitted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ evidenceId, isUpvote }: { evidenceId: number, isUpvote: boolean }) => {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidenceId, isUpvote }),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/markets', marketId, 'evidence'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    evidence,
    isLoading,
    submit: submitMutation.mutate,
    vote: voteMutation.mutate,
  };
}