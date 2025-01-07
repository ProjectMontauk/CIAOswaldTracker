import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvidence } from "@/hooks/use-evidence";
import { usePredictions } from "@/hooks/use-predictions";
import { ArrowUp, ArrowDown, FileText, Trophy, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { TrendingUp, Vote, Shield } from "lucide-react";

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

export default function HomePage() {
  const { evidence, submit: submitEvidence, vote, isLoading: evidenceLoading } = useEvidence();
  const { predictions, averagePrediction, submit: submitPrediction, isLoading: predictionsLoading, marketOdds, yesAmount, noAmount, totalLiquidity, submit: betSubmit, isLoading: betLoading } = usePredictions();
  const [probability, setProbability] = useState(50);
  const evidenceForm = useForm<EvidenceFormData>({
    defaultValues: {
      title: '',
      content: '',
      text: '',
      evidenceType: 'yes'
    }
  });

  const onEvidenceSubmit = (data: EvidenceFormData) => {
    const contentWithType = data.content ?
      (data.evidenceType === 'no' ? `no-evidence:${data.content}` : data.content) :
      (data.evidenceType === 'no' ? 'no-evidence:none' : 'none');

    submitEvidence({
      title: data.title,
      content: contentWithType,
      text: data.text,
    });
    evidenceForm.reset();
  };

  const sortedEvidence = [...evidence].sort((a, b) => {
    const aVotes = (a as any).votes?.reduce((acc: number, v: { isUpvote: boolean }) =>
      acc + (v.isUpvote ? 1 : -1), 0) ?? 0;
    const bVotes = (b as any).votes?.reduce((acc: number, v: { isUpvote: boolean }) =>
      acc + (v.isUpvote ? 1 : -1), 0) ?? 0;
    return bVotes - aVotes;
  });

  const yesEvidence = sortedEvidence.filter(item => !item.content?.includes('no-evidence'));
  const noEvidence = sortedEvidence.filter(item => item.content?.includes('no-evidence'));

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
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Welcome to Twit</h1>
            <p className="text-xl text-muted-foreground">
              A home for truth and good spirited debate on the internet
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Prediction Markets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Make predictions and earn rewards by contributing to collective knowledge.</p>
                <Link href="/markets">
                  <Button className="w-full">View Prediction Markets</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Create New Market
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Start your own prediction market and let the crowd discover the truth.</p>
                  <Link href="/predict">
                    <Button variant="outline" className="w-full">Create Market</Button>
                  </Link>
                </CardContent>
              </Card>
          </div>

          {/* Trending Markets Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-6">Trending Markets</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Link href="/predict" className="block">
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          CIA's Contact with Lee Harvey Oswald
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Did the CIA have contact with Lee Harvey Oswald prior to JFK's assassination?
                        </p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>
                  {/* Add more prediction markets here as they are created */}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center">Key Features</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-3 inline-block mb-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Advanced Markets</h3>
                <p className="text-sm text-muted-foreground">
                  Direct numerical bet input and real-time market consensus tracking
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-3 inline-block mb-3">
                  <Vote className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Collaborative Research</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time collaboration and voting on evidence validity
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-3 inline-block mb-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">AI Enhancement</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered evidence verification and analysis tools
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}