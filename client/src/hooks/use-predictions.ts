import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Prediction } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

type PredictionSubmission = {
  position: 'yes' | 'no';
  amount: number;
  marketId: number;
};

export function usePredictions(marketId?: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: market, refetch: refetchMarket } = useQuery({
    queryKey: [`/api/markets/${marketId}`],
    queryFn: async () => {
      const res = await fetch(`/api/markets/${marketId}`);
      if (!res.ok) throw new Error('Failed to fetch market');
      return res.json();
    },
    enabled: !!marketId,
  });

  const { data: predictions = [], isLoading } = useQuery<Prediction[]>({
    queryKey: ['/api/predictions', marketId],
    enabled: !!marketId,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { position: 'yes' | 'no', amount: number }) => {
      if (!marketId) {
        throw new Error('Market ID is required');
      }

      console.log('Submitting prediction:', { ...data, marketId });

      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: data.position,
          amount: Number(data.amount),
          marketId: marketId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit prediction');
      }

      return res.json();
    },
    onSuccess: async (data) => {
      console.log('Prediction submitted successfully:', data);
      // Invalidate and refetch both queries
      await queryClient.invalidateQueries({ queryKey: [`/api/markets/${marketId}`] });
      await queryClient.invalidateQueries({ queryKey: ['/api/predictions', marketId] });
      await refetchMarket(); // Explicitly refetch market data
      
      toast({
        title: "Success",
        description: "Prediction submitted successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Prediction submission failed:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    market,
    predictions: market?.predictions ?? [],
    submit: submitMutation.mutate,
    isLoading: submitMutation.isLoading,
    marketOdds: {
      yes: market?.currentOdds?.yes ?? 0.5,
      no: market?.currentOdds?.no ?? 0.5,
    },
    yesAmount: market?.yesAmount ?? 0,
    noAmount: market?.noAmount ?? 0,
    totalLiquidity: market?.totalLiquidity ?? 0,
  };
}