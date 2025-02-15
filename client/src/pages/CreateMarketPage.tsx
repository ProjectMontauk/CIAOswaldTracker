import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type MarketFormData = {
  title: string;
  description: string;
  yesCondition: string;
  noCondition: string;
  startingOdds: number;
};

export default function CreateMarketPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<MarketFormData>({
    defaultValues: {
      title: "",
      description: "",
      yesCondition: "",
      noCondition: "",
      startingOdds: 50,
    },
  });

  const onSubmit = async (data: MarketFormData) => {
    try {
      const response = await fetch('/api/markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: "Success",
        description: "Market created successfully",
      });

      navigate('/markets');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create market',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h2 className="text-2xl font-bold text-primary">Create New Market</h2>
          <p className="text-sm text-muted-foreground">Define your prediction market</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Market Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Market Question</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Will Bitcoin reach $100,000 by the end of 2024?"
                    {...form.register("title", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide additional context or details..."
                    {...form.register("description", { required: true })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yesCondition">"Yes" Resolution Criteria</Label>
                  <Textarea
                    id="yesCondition"
                    placeholder="Define what needs to happen for this market to resolve as 'Yes'..."
                    {...form.register("yesCondition", { required: true })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="noCondition">"No" Resolution Criteria</Label>
                  <Textarea
                    id="noCondition"
                    placeholder="Define what needs to happen for this market to resolve as 'No'..."
                    {...form.register("noCondition", { required: true })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startingOdds">Starting Probability (%)</Label>
                  <Input
                    id="startingOdds"
                    type="number"
                    min={1}
                    max={99}
                    {...form.register("startingOdds", {
                      required: true,
                      min: 1,
                      max: 99,
                      valueAsNumber: true,
                    })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Set the initial probability between 1% and 99%.
                  </p>
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