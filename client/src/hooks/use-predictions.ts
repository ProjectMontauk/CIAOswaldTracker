import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Prediction } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

export function usePredictions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: predictions = [], isLoading } = useQuery<Prediction[]>({
    queryKey: ['/api/predictions'],
  });

  const submitMutation = useMutation({
    mutationFn: async (probability: number) => {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ probability }),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/predictions'] });
      toast({
        title: "Success",
        description: "Prediction submitted successfully",
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

  // Calculate average prediction
  const averagePrediction = predictions.length > 0
    ? predictions.reduce((acc, p) => acc + p.probability, 0) / predictions.length
    : 0;

  return {
    predictions,
    averagePrediction,
    isLoading,
    submit: submitMutation.mutate,
  };
}
