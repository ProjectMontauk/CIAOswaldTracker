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

  // Added logging for marketId
  console.log('useEvidence hook called with marketId:', marketId);

  const { data: evidence = [], isLoading } = useQuery<EvidenceWithRelations[]>({
    queryKey: ['/api/evidence', marketId],
    queryFn: async () => {
      const url = `/api/evidence${marketId ? `?marketId=${marketId}` : ''}`;
      console.log('Fetching evidence from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch evidence');
      }
      const data = await response.json();
      console.log('Fetched evidence:', data);
      return data;
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: EvidenceSubmission) => {
      console.log('Submitting evidence:', { ...data, marketId });
      const res = await fetch('/api/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          marketId: marketId, // Ensure marketId is included in submission
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const result = await res.json();
      console.log('Evidence submission response:', result);
      return result;
    },
    onSuccess: () => {
      // Invalidate both the specific market query and the general evidence query
      queryClient.invalidateQueries({ queryKey: ['/api/evidence', marketId] });
      toast({
        title: "Success",
        description: "Evidence submitted successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Evidence submission error:', error);
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