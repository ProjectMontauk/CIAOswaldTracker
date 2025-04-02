import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import type { Market } from '@db/schema';

export default function MarketsPage() {
  const queryClient = useQueryClient();
  
  const { data: markets = [] } = useQuery<Market[]>({
    queryKey: ['markets'],
    queryFn: () => fetch('/api/markets').then(res => res.json())
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary">Tinfoil</h2>
              <p className="text-sm text-muted-foreground">Question it All</p>
            </div>
            <Link to="/markets/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Market
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Active Prediction Markets</h1>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => (
              <Card key={market.id} className="hover:shadow-lg transition-shadow bg-white rounded-lg overflow-hidden">
                <Link to={`/markets/${market.id}`} className="block">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold">{market.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">
                        <span>Market Size: ${(Number(market.yesAmount) + Number(market.noAmount)).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 