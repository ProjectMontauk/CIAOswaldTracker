import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvidence } from "@/hooks/use-evidence";
import { usePredictions } from "@/hooks/use-predictions";
import { ArrowUp, ArrowDown } from "lucide-react";

type EvidenceFormData = {
  title: string;
  content: string;
};

export default function HomePage() {
  const { evidence, submit: submitEvidence, vote, isLoading: evidenceLoading } = useEvidence();
  const { predictions, averagePrediction, submit: submitPrediction, isLoading: predictionsLoading } = usePredictions();
  const [probability, setProbability] = useState(50);
  const evidenceForm = useForm<EvidenceFormData>();

  const onEvidenceSubmit = (data: EvidenceFormData) => {
    submitEvidence(data);
    evidenceForm.reset();
  };

  const onPredictionSubmit = () => {
    submitPrediction(probability);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Company Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h2 className="text-2xl font-bold text-primary">Twit</h2>
            <p className="text-sm text-muted-foreground">The Truth Will Save Us!</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Did the CIA have contact with Lee Harvey Oswald prior to JFK's assassination?</h1>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Prediction Market Section */}
          <Card>
            <CardHeader>
              <CardTitle>Prediction Market</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Current Consensus: {Math.round(averagePrediction)}%</Label>
                  <div className="h-2 bg-gray-200 rounded-full mt-2">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${averagePrediction}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label>Your Prediction</Label>
                  <Slider
                    value={[probability]}
                    onValueChange={([value]) => setProbability(value)}
                    min={0}
                    max={100}
                    step={1}
                  />
                  <div className="text-center text-sm text-gray-600">
                    {probability}% likelihood of CIA-Oswald connection
                  </div>
                  <Button
                    onClick={onPredictionSubmit}
                    className="w-full"
                    disabled={predictionsLoading}
                  >
                    Submit Prediction
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Section */}
          <Card>
            <CardHeader>
              <CardTitle>Evidence Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="submit">
                <TabsList className="w-full">
                  <TabsTrigger value="submit" className="flex-1">Submit Evidence</TabsTrigger>
                  <TabsTrigger value="view" className="flex-1">View Evidence</TabsTrigger>
                </TabsList>
                <TabsContent value="submit">
                  <form onSubmit={evidenceForm.handleSubmit(onEvidenceSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        {...evidenceForm.register("title", { required: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        {...evidenceForm.register("content", { required: true })}
                        rows={4}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={evidenceLoading}>
                      Submit Evidence
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="view">
                  <div className="space-y-4">
                    {evidence.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => vote({ evidenceId: item.id, isUpvote: true })}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <span className="text-sm">
                                {(item as any).votes?.reduce((acc: number, v: { isUpvote: boolean }) =>
                                  acc + (v.isUpvote ? 1 : -1), 0) ?? 0}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => vote({ evidenceId: item.id, isUpvote: false })}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{item.title}</h3>
                              <p className="mt-2">{item.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}