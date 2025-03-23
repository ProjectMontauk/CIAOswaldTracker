import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { Plus, Home } from "lucide-react";

export default function CreateMarketPage() {
  const [, setLocation] = useLocation();
  const [marketData, setMarketData] = useState({
    title: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/markets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(marketData),
      });

      if (!res.ok) {
        throw new Error("Failed to create market");
      }

      const market = await res.json();
      setLocation(`/markets/${market.id}`);
    } catch (error) {
      console.error("Error creating market:", error);
    }
  };

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
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Create a Market</h2>
                  <div className="space-y-4">
                    <div>
                      <Input
                        placeholder="Market Title"
                        value={marketData.title}
                        onChange={(e) =>
                          setMarketData({ ...marketData, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Market Description"
                        value={marketData.description}
                        onChange={(e) =>
                          setMarketData({
                            ...marketData,
                            description: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Create Market
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}