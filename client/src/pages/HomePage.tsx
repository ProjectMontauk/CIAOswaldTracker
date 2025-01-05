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
import { ArrowUp, ArrowDown, FileText, Star } from "lucide-react";

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

  // Sort evidence by vote count (credibility ranking)
  const sortedEvidence = [...evidence].sort((a, b) => {
    const aVotes = (a as any).votes?.reduce((acc: number, v: { isUpvote: boolean }) => 
      acc + (v.isUpvote ? 1 : -1), 0) ?? 0;
    const bVotes = (b as any).votes?.reduce((acc: number, v: { isUpvote: boolean }) => 
      acc + (v.isUpvote ? 1 : -1), 0) ?? 0;
    return bVotes - aVotes;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Company Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h2 className="text-2xl font-bold text-primary">Twit</h2>
            <p className="text-sm text-muted-foreground">In Truth We Trust!</p>
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

          {/* Document Collection Section */}
          <Card>
            <CardHeader>
              <CardTitle>CIA-Oswald Document Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="view">
                <TabsList className="w-full">
                  <TabsTrigger value="submit" className="flex-1">Submit Document</TabsTrigger>
                  <TabsTrigger value="view" className="flex-1">View Documents</TabsTrigger>
                </TabsList>
                <TabsContent value="submit">
                  <form onSubmit={evidenceForm.handleSubmit(onEvidenceSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Document Title/Source</Label>
                      <Input
                        id="title"
                        placeholder="e.g., CIA Memo dated Sept 1963"
                        {...evidenceForm.register("title", { required: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Document Content & Analysis</Label>
                      <Textarea
                        id="content"
                        placeholder="Describe the document's content and explain how it demonstrates CIA-Oswald connection..."
                        {...evidenceForm.register("content", { required: true })}
                        rows={4}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={evidenceLoading}>
                      Submit Document
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="view">
                  <div className="space-y-4">
                    {sortedEvidence.map((item, index) => (
                      <Card key={item.id} className="relative">
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="mb-2 text-sm font-semibold text-primary">
                                #{index + 1}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => vote({ evidenceId: item.id, isUpvote: true })}
                                className="text-green-600"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <span className="text-sm font-medium">
                                {(item as any).votes?.reduce((acc: number, v: { isUpvote: boolean }) =>
                                  acc + (v.isUpvote ? 1 : -1), 0) ?? 0}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => vote({ evidenceId: item.id, isUpvote: false })}
                                className="text-red-600"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <h3 className="font-semibold">{item.title}</h3>
                              </div>
                              <p className="mt-2 text-sm text-gray-600">{item.content}</p>
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