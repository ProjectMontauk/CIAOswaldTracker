import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Evidence, User, Vote } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

type EvidenceSubmission = {
  title: string;
  content: string;
  text: string;
};

type EvidenceWithRelations = Evidence & {
  user?: User;
  votes?: Vote[];
  text?: string;
};

export function useEvidence() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: evidence = [], isLoading } = useQuery<EvidenceWithRelations[]>({
    queryKey: ['/api/evidence'],
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
      queryClient.invalidateQueries({ queryKey: ['/api/evidence'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/evidence'] });
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