import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, Home } from "lucide-react";

export default function PredictionMarketsPage() {
  const { data: markets, isLoading, error } = useQuery({
    queryKey: ['/api/markets'],
    queryFn: async () => {
      const res = await fetch('/api/markets');
      if (!res.ok) throw new Error('Failed to fetch markets');
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary">Graphica</h2>
              <p className="text-sm text-muted-foreground">Question Everything. Bet on Truth.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="default" className="bg-[#0f172a] hover:bg-[#1e293b]">
                  <Home className="h-5 w-5 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/markets/create">
                <Button variant="default" className="bg-[#0f172a] hover:bg-[#1e293b]">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Market
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6">
            {markets?.map((market) => (
              <Link key={market.id} href={`/predict/${market.id}`}>
                <Card className="hover:shadow-md transition-shadow">
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
                            Active Participants: {market.predictions?.length || 0}
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