import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEvidence } from "@/hooks/use-evidence";
import { usePredictions } from "@/hooks/use-predictions";
import { ArrowUp, ArrowDown, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Trophy, ThumbsUp, ThumbsDown } from "lucide-react";

type EvidenceFormData = {
  title: string;
  content: string;
  text: string;
  evidenceType: 'yes' | 'no';
};

export default function HomePage() {
  const { evidence, submit: submitEvidence, vote, isLoading: evidenceLoading } = useEvidence();
  const { predictions, averagePrediction, submit: submitPrediction, isLoading: predictionsLoading } = usePredictions();
  const [probability, setProbability] = useState(50);
  const evidenceForm = useForm<EvidenceFormData>();

  const onEvidenceSubmit = (data: EvidenceFormData) => {
    const contentWithType = data.content ? 
      (data.evidenceType === 'no' ? `no-evidence:${data.content}` : data.content) :
      (data.evidenceType === 'no' ? 'no-evidence:none' : 'none');

    submitEvidence({
      ...data,
      content: contentWithType,
    });
    evidenceForm.reset();
  };

  const onPredictionSubmit = () => {
    submitPrediction(probability);
  };

  const sortedEvidence = [...evidence].sort((a, b) => {
    const aVotes = (a as any).votes?.reduce((acc: number, v: { isUpvote: boolean }) =>
      acc + (v.isUpvote ? 1 : -1), 0) ?? 0;
    const bVotes = (b as any).votes?.reduce((acc: number, v: { isUpvote: boolean }) =>
      acc + (v.isUpvote ? 1 : -1), 0) ?? 0;
    return bVotes - aVotes;
  });

  return (
    <div className="min-h-screen bg-gray-50">
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

        <div className="space-y-8 max-w-4xl mx-auto">
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

          <Card>
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="view-yes">
                <TabsList className="w-full">
                  <TabsTrigger value="view-yes" className="flex-1">View "Yes" Documents</TabsTrigger>
                  <TabsTrigger value="view-no" className="flex-1">View "No" Documents</TabsTrigger>
                  <TabsTrigger value="submit" className="flex-1">Submit Document</TabsTrigger>
                </TabsList>
                <TabsContent value="view-yes">
                  <div className="space-y-4">
                    {sortedEvidence.filter(item => !item.content?.includes('no-evidence')).map((item, index) => {
                      const upvotes = (item as any).votes?.filter((v: { isUpvote: boolean }) => v.isUpvote).length ?? 0;
                      const downvotes = (item as any).votes?.filter((v: { isUpvote: boolean }) => !v.isUpvote).length ?? 0;
                      const voteScore = upvotes - downvotes;
                      const user = (item as any).user;
                      const reputation = user?.reputation ?? 0;

                      return (
                        <Card key={item.id} className="relative">
                          <CardContent className="pt-6">
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="mb-2 text-sm font-semibold text-primary flex items-center gap-2">
                                  #{index + 1}
                                  {reputation > 50 && (
                                    <Trophy className="h-4 w-4 text-yellow-500" title="High Reputation User" />
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => vote({ evidenceId: item.id, isUpvote: true })}
                                  className="text-green-600 relative group"
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium">
                                  <Badge variant={voteScore > 0 ? "default" : "destructive"} className="text-xs">
                                    {voteScore}
                                  </Badge>
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => vote({ evidenceId: item.id, isUpvote: false })}
                                  className="text-red-600 relative group"
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  {item.content && item.content.startsWith('http') ? (
                                    <a
                                      href={item.content}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-semibold hover:underline"
                                    >
                                      {item.title}
                                    </a>
                                  ) : (
                                    <h3 className="font-semibold">{item.title}</h3>
                                  )}
                                  <div className="ml-auto flex items-center gap-2">
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <ThumbsUp className="h-3 w-3 mr-1" />
                                      {upvotes}
                                      <ThumbsDown className="h-3 w-3 ml-2 mr-1" />
                                      {downvotes}
                                    </div>
                                  </div>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">{item.text || item.content}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
                <TabsContent value="view-no">
                  <div className="space-y-4">
                    {sortedEvidence.filter(item => item.content?.includes('no-evidence')).map((item, index) => {
                      const upvotes = (item as any).votes?.filter((v: { isUpvote: boolean }) => v.isUpvote).length ?? 0;
                      const downvotes = (item as any).votes?.filter((v: { isUpvote: boolean }) => !v.isUpvote).length ?? 0;
                      const voteScore = upvotes - downvotes;
                      const user = (item as any).user;
                      const reputation = user?.reputation ?? 0;

                      return (
                        <Card key={item.id} className="relative">
                          <CardContent className="pt-6">
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="mb-2 text-sm font-semibold text-primary flex items-center gap-2">
                                  #{index + 1}
                                  {reputation > 50 && (
                                    <Trophy className="h-4 w-4 text-yellow-500" title="High Reputation User" />
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => vote({ evidenceId: item.id, isUpvote: true })}
                                  className="text-green-600 relative group"
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium">
                                  <Badge variant={voteScore > 0 ? "default" : "destructive"} className="text-xs">
                                    {voteScore}
                                  </Badge>
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => vote({ evidenceId: item.id, isUpvote: false })}
                                  className="text-red-600 relative group"
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  {item.content && item.content.startsWith('http') ? (
                                    <a
                                      href={item.content}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-semibold hover:underline"
                                    >
                                      {item.title}
                                    </a>
                                  ) : (
                                    <h3 className="font-semibold">{item.title}</h3>
                                  )}
                                  <div className="ml-auto flex items-center gap-2">
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <ThumbsUp className="h-3 w-3 mr-1" />
                                      {upvotes}
                                      <ThumbsDown className="h-3 w-3 ml-2 mr-1" />
                                      {downvotes}
                                    </div>
                                  </div>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">{item.text || item.content}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
                <TabsContent value="submit">
                  <form onSubmit={evidenceForm.handleSubmit(onEvidenceSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Evidence Type</Label>
                      <RadioGroup
                        defaultValue="yes"
                        {...evidenceForm.register("evidenceType")}
                        className="flex flex-row space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="yes" />
                          <Label htmlFor="yes">Yes Evidence</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="no" />
                          <Label htmlFor="no">No Evidence</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., CIA Memo dated Sept 1963"
                        {...evidenceForm.register("title", { required: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">URL</Label>
                      <Input
                        id="content"
                        placeholder="Enter the URL of the document..."
                        {...evidenceForm.register("content", { required: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="text">Text</Label>
                      <Textarea
                        id="text"
                        placeholder="Enter the document text or analysis..."
                        {...evidenceForm.register("text", { required: true })}
                        rows={4}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={evidenceLoading}>
                      Submit Document
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}