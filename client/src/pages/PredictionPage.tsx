import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvidence } from "@/hooks/use-evidence";
import { usePredictions } from "@/hooks/use-predictions";
import { ArrowUp, ArrowDown, FileText, Trophy, ThumbsUp, ThumbsDown, Trash2, Home, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Market } from "@db/schema";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Helper function to extract domain from URL
function getDomainFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

type EvidenceFormData = {
  title: string;
  content: string;
  text: string;
  evidenceType: 'yes' | 'no';
};

export default function PredictionPage({ params }: { params?: { id?: string } }) {
  const marketId = params?.id ? parseInt(params.id) : undefined;
  const { evidence, submit: submitEvidence, vote, isLoading: evidenceLoading } = useEvidence(marketId);
  const { predictions, submit: submitPrediction, isLoading: predictionsLoading, marketOdds, yesAmount, noAmount, totalLiquidity } = usePredictions();
  const [betAmount, setBetAmount] = useState(0);

  // Only fetch market data if we have an ID (not the CIA market)
  const { data: market, isLoading: marketLoading } = useQuery<Market>({
    queryKey: ['/api/markets', params?.id],
    enabled: !!params?.id,
  });

  const evidenceForm = useForm<EvidenceFormData>({
    defaultValues: {
      title: '',
      content: '',
      text: '',
      evidenceType: 'yes'
    }
  });

  // Display loading state while market data is being fetched
  if (params?.id && marketLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading market data...</p>
        </div>
      </div>
    );
  }

  // Show error if market not found
  if (params?.id && !market) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Market Not Found</h1>
          <p className="text-muted-foreground">The requested prediction market could not be found.</p>
        </div>
      </div>
    );
  }

  const onEvidenceSubmit = (data: EvidenceFormData) => {
    console.log('Submitting evidence with:', {
      ...data,
      marketId
    });

    submitEvidence({
      title: data.title,
      content: data.content,
      text: data.text,
      marketId,
      evidenceType: data.evidenceType,
    });
    evidenceForm.reset();
  };

  // Filter evidence based on type
  const yesEvidence = evidence.filter(item => {
    console.log('Filtering yes evidence item:', item);
    return item.evidenceType === 'yes';
  });

  const noEvidence = evidence.filter(item => {
    console.log('Filtering no evidence item:', item);
    return item.evidenceType === 'no';
  });

  console.log('Market ID:', marketId);
  console.log('All evidence:', evidence);
  console.log('Yes evidence:', yesEvidence);
  console.log('No evidence:', noEvidence);


  // Get the appropriate title and description based on whether we're viewing a specific market or the CIA market
  const title = params?.id
    ? market?.title
    : "Did the CIA have contact with Lee Harvey Oswald prior to JFK's assassination?";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary">Kane Inquirer</h2>
              <p className="text-sm text-muted-foreground">Question Everything</p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="ghost">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/markets/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Market
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4">{title}</h1>
          {market?.description && (
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
              {market.description}
            </p>
          )}
        </div>

        <div className="space-y-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Prediction Market</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Market Odds</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-3xl font-bold text-primary">
                        {(marketOdds * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Yes</p>
                      <p className="text-xs text-muted-foreground">
                        Total: ${yesAmount.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-3xl font-bold text-primary">
                        {((1 - marketOdds) * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">No</p>
                      <p className="text-xs text-muted-foreground">
                        Total: ${noAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Bet Amount ($)</Label>
                    <Input
                      type="number"
                      value={betAmount === 0 ? '' : betAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Remove leading zeros and convert to number
                        const numValue = value ? parseInt(value.replace(/^0+/, '')) : 0;
                        setBetAmount(numValue);
                      }}
                      min={1}
                      max={100}
                      className="my-4"
                      placeholder="Enter bet amount"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => submitPrediction({ position: 'yes', amount: betAmount })}
                      disabled={predictionsLoading}
                      className="w-full"
                      variant="default"
                    >
                      Bet Yes
                    </Button>
                    <Button
                      onClick={() => submitPrediction({ position: 'no', amount: betAmount })}
                      disabled={predictionsLoading}
                      className="w-full"
                      variant="outline"
                    >
                      Bet No
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Market Size: ${totalLiquidity.toFixed(2)}</p>
                  <p>Total Predictions: {predictions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Evidence</CardTitle>
                {marketId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All Evidence
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will clear all evidence documents for this prediction market.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => marketId && clear(marketId)}>
                          Clear Evidence
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
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
                    {yesEvidence.map((item, index) => {
                      const upvotes = (item as any).votes?.filter((v: { isUpvote: boolean }) => v.isUpvote).length ?? 0;
                      const downvotes = (item as any).votes?.filter((v: { isUpvote: boolean }) => !v.isUpvote).length ?? 0;
                      const voteScore = upvotes - downvotes;
                      const user = (item as any).user;
                      const reputation = user?.reputation ?? 0;
                      const domain = item.content?.startsWith('http') ? getDomainFromUrl(item.content) : null;
                      const titleWithDomain = domain ? `${item.title} (${domain})` : item.title;

                      return (
                        <Card key={item.id} className="relative">
                          <CardContent className="pt-6">
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="mb-2 text-sm font-semibold text-primary flex items-center gap-2">
                                  #{index + 1}
                                  {reputation > 50 && (
                                    <Trophy className="h-4 w-4 text-yellow-500" aria-label="High Reputation User" />
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
                                  {item.content?.startsWith('http') ? (
                                    <a
                                      href={item.content}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-semibold hover:underline"
                                    >
                                      {titleWithDomain}
                                    </a>
                                  ) : (
                                    <h3 className="font-semibold">{titleWithDomain}</h3>
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
                                {(item as any).text && (
                                  <p className="mt-2 text-sm text-gray-600">{(item as any).text}</p>
                                )}
                                {(!item.content?.startsWith('http') && item.content !== 'none') && (
                                  <p className="mt-2 text-sm text-gray-600">{item.content}</p>
                                )}
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
                    {noEvidence.map((item, index) => {
                      const upvotes = (item as any).votes?.filter((v: { isUpvote: boolean }) => v.isUpvote).length ?? 0;
                      const downvotes = (item as any).votes?.filter((v: { isUpvote: boolean }) => !v.isUpvote).length ?? 0;
                      const voteScore = upvotes - downvotes;
                      const user = (item as any).user;
                      const reputation = user?.reputation ?? 0;
                      const actualContent = item.content;
                      const domain = actualContent && actualContent.startsWith('http') ? getDomainFromUrl(actualContent) : null;
                      const titleWithDomain = domain ? `${item.title} (${domain})` : item.title;

                      return (
                        <Card key={item.id} className="relative">
                          <CardContent className="pt-6">
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="mb-2 text-sm font-semibold text-primary flex items-center gap-2">
                                  #{index + 1}
                                  {reputation > 50 && (
                                    <Trophy className="h-4 w-4 text-yellow-500" aria-label="High Reputation User" />
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
                                  {actualContent && actualContent.startsWith('http') ? (
                                    <a
                                      href={actualContent}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-semibold hover:underline"
                                    >
                                      {titleWithDomain}
                                    </a>
                                  ) : (
                                    <h3 className="font-semibold">{titleWithDomain}</h3>
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
                                {(item as any).text && (
                                  <p className="mt-2 text-sm text-gray-600">{(item as any).text}</p>
                                )}
                                {(!actualContent?.startsWith('http') && actualContent !== 'none') && (
                                  <p className="mt-2 text-sm text-gray-600">{actualContent}</p>
                                )}
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
                      <div className="flex flex-row space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="yes"
                            value="yes"
                            {...evidenceForm.register("evidenceType")}
                            defaultChecked
                            className="text-primary"
                          />
                          <Label htmlFor="yes">Yes Evidence</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="no"
                            value="no"
                            {...evidenceForm.register("evidenceType")}
                            className="text-primary"
                          />
                          <Label htmlFor="no">No Evidence</Label>
                        </div>
                      </div>
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