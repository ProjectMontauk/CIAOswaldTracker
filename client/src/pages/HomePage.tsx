import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary">Graphica</h2>
              <p className="text-sm text-muted-foreground">Question Everything. Bet on Truth.</p>
            </div>
            <Link href="/markets/create">
              <Button variant="default" className="bg-[#0f172a] hover:bg-[#1e293b]">
                <Plus className="h-5 w-5 mr-2" />
                Create Market
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Welcome to Graphica</h1>
            <p className="text-xl text-muted-foreground">
              A home for truth and good spirited debate on the internet
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prediction Markets Card */}
            <Card className="p-8 rounded-lg">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  <h2 className="text-2xl font-semibold">Prediction Markets</h2>
                </div>
                <p className="text-lg text-muted-foreground">
                  Make predictions and earn rewards by contributing to collective knowledge.
                </p>
                <Link href="/markets" className="block">
                  <Button className="w-full bg-[#0f172a] text-white hover:bg-[#1e293b]">
                    View Prediction Markets
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Create Market Card */}
            <Card className="p-8 rounded-lg">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  <h2 className="text-2xl font-semibold">Create New Market</h2>
                </div>
                <p className="text-lg text-muted-foreground">
                  Start your own prediction market and let the crowd discover the truth.
                </p>
                <Link href="/markets/create" className="block">
                  <Button variant="secondary" className="w-full bg-gray-100 hover:bg-gray-200">
                    Create Market
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}