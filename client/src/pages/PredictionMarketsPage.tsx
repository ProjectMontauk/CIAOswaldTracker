import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { Market } from "@db/schema";

export default function PredictionMarketsPage() {
  const { data: markets = [], isLoading } = useQuery<Market[]>({
    queryKey: ['/api/markets'],
    queryFn: async () => {
      const response = await fetch('/api/markets');
      if (!response.ok) throw new Error('Failed to fetch markets');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading markets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary">Prediction Markets</h2>
              <p className="text-sm text-muted-foreground">View and participate in prediction markets</p>
            </div>
            <Link href="/markets/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Market
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {markets.map((market) => (
              <Link key={market.id} href={`/predict/${market.id}`}>
                <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">
                      {market.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {market.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}