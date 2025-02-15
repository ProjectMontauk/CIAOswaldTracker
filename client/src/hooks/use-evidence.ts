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
  text?: string;
};

export function useEvidence(marketId?: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: evidence = [], isLoading } = useQuery<EvidenceWithRelations[]>({
    queryKey: ['/api/evidence', marketId],
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
      queryClient.invalidateQueries({ queryKey: ['/api/evidence', marketId] });
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

  const clearMutation = useMutation({
    mutationFn: async (marketId: number) => {
      const res = await fetch(`/api/markets/${marketId}/clear-evidence`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evidence', marketId] });
      toast({
        title: "Success",
        description: "Evidence cleared successfully",
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
      queryClient.invalidateQueries({ queryKey: ['/api/evidence', marketId] });
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
    clear: clearMutation.mutate,
  };
}