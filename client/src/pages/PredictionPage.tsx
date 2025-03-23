import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { usePredictions } from "@/hooks/use-predictions";
import { PredictionForm } from "@/components/prediction-form.tsx";
import { EvidenceSection } from "@/components/evidence-section.tsx";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Home } from "lucide-react";
import { useState, useEffect } from "react";

interface Market {
  id: number;
  title: string;
  yes_resolution: string;
  no_resolution: string;
  createdAt: string;
  predictions: Array<any>;
  totalPool?: number;
}

export default function PredictionPage({ params }: { params?: { id?: string } }) {
  const marketId = params?.id ? parseInt(params.id) : undefined;
  const [betAmount, setBetAmount] = useState<string>('');
  const [showRules, setShowRules] = useState(false);
  const { predictions, submit, isLoading, marketOdds } = usePredictions(marketId);

  // Default to 50-50 odds if marketOdds is null or undefined
  const displayOdds = {
    yes: marketOdds?.yes ?? 0.5,
    no: marketOdds?.no ?? 0.5
  };

  // Add market details query
  const { data: market } = useQuery<Market>({
    queryKey: [`/api/markets/${marketId}`],
    queryFn: async () => {
      const res = await fetch(`/api/markets/${marketId}`);
      if (!res.ok) throw new Error("Failed to fetch market");
      return res.json();
    },
    enabled: !!marketId,
  });

  useEffect(() => {
    if (market) {
      console.log('Full market object:', market);
      console.log('Yes Resolution:', market.yes_resolution);
      console.log('No Resolution:', market.no_resolution);
    }
  }, [market]);

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
        <div className="max-w-4xl mx-auto space-y-6">
          {market && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">{market.title}</h2>
                
                <div className="space-y-6">
                  <h3 className="text-base font-medium">Market Odds</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-lg border">
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">
                          {(displayOdds.yes * 100).toFixed(1)}%
                        </div>
                        <div className="text-gray-600 mb-2 text-sm">Yes</div>
                        <div className="text-gray-600 text-sm">Total: ${(displayOdds.yes * (market.totalPool || 0)).toFixed(2)}</div>
                      </div>
                    </div>
                    
                    <div className="p-6 rounded-lg border">
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">
                          {(displayOdds.no * 100).toFixed(1)}%
                        </div>
                        <div className="text-gray-600 mb-2 text-sm">No</div>
                        <div className="text-gray-600 text-sm">Total: ${(displayOdds.no * (market.totalPool || 0)).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-base font-medium">Bet Amount ($)</label>
                      <input
                        type="number"
                        placeholder="Enter bet amount"
                        className="w-full mt-2 p-3 border rounded-lg"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        className="w-full py-3 px-4 bg-[#0f172a] text-white rounded-lg hover:bg-[#1e293b]"
                        onClick={() => submit({ position: 'yes', amount: Number(betAmount) })}
                      >
                        Bet Yes
                      </button>
                      <button
                        className="w-full py-3 px-4 border border-[#0f172a] text-[#0f172a] rounded-lg hover:bg-gray-50"
                        onClick={() => submit({ position: 'no', amount: Number(betAmount) })}
                      >
                        Bet No
                      </button>
                    </div>

                    <div className="text-gray-600 space-y-1 text-sm">
                      <div>Market Size: ${market.totalPool?.toFixed(2) || '0.00'}</div>
                      <div>Total Predictions: {market.predictions?.length || 0}</div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-base font-medium mb-2">Rules</h3>
                    <button
                      onClick={() => setShowRules(!showRules)}
                      className="text-sm text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1"
                    >
                      {showRules ? 'Show Less' : 'Read More'}
                      <span 
                        className={`inline-block transition-transform duration-200 ${
                          showRules ? 'rotate-180' : ''
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                    
                    {showRules && (
                      <div className="space-y-4 animate-fadeIn">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2"></h4>
                          <p className="text-gray-600">
                            {market.yes_resolution || 'No yes resolution condition specified'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2"></h4>
                          <p className="text-gray-600">
                            {market.no_resolution || 'No no resolution condition specified'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <EvidenceSection marketId={marketId} />
        </div>
      </div>
    </div>
  );
}