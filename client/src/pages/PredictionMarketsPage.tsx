import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function PredictionMarketsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h2 className="text-2xl font-bold text-primary">Twit</h2>
            <p className="text-sm text-muted-foreground">In Truth We Trust</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Active Prediction Markets</h1>
          
          <div className="space-y-4">
            <Link href="/predict" className="block">
              <Card className="hover:bg-gray-50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        CIA's Contact with Lee Harvey Oswald
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Did the CIA have contact with Lee Harvey Oswald prior to JFK's assassination?
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-sm text-muted-foreground">Active Participants: 24</span>
                        <span className="text-sm text-muted-foreground">Market Size: $2,450</span>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            {/* More prediction markets can be added here */}
          </div>
        </div>
      </div>
    </div>
  );
}
