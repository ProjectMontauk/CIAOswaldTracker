import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface PredictionSubmitData {
  marketId: number;
  prediction: 'yes' | 'no';
  amount: number;
}

export function usePredictions(marketId: number) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const submitPrediction = async (data: PredictionSubmitData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketId: data.marketId,
          prediction: data.prediction,
          amount: data.amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: "Prediction submitted successfully",
      });

      return data;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to submit prediction',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitPrediction,
    isLoading,
    // ... rest of your return values
  };
} 