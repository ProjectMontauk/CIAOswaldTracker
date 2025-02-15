import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Plus } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { Market } from "@db/schema";

export default function PredictionMarketsPage() {
  const { data: markets = [] } = useQuery<Market[]>({
    queryKey: ['/api/markets'],
    queryFn: async () => {
      const response = await fetch('/api/markets');
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary">Kane</h2>
              <p className="text-sm text-muted-foreground">In Truth We Trust</p>
            </div>
            <Link href="/markets/create">
              <Button variant="secondary" className="bg-gray-100">
                <Plus className="h-4 w-4 mr-2" />
                Create Market
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Active Prediction Markets</h1>

          <div className="space-y-4">
            {markets.map((market) => (
              <Link key={market.id} href={`/predict/${market.id}`} className="block">
                <Card className="hover:bg-gray-50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          {market.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {market.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-sm text-muted-foreground">
                            Active Participants: {market.participants}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Market Size: ${Number(market.totalLiquidity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </div>
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