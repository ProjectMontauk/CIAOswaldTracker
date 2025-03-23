import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, ArrowBigUp, ArrowBigDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Evidence {
  id: number;
  title: string;
  url: string;
  content: string;
  evidenceType: 'yes' | 'no';
  votes: Array<{ value: number }>;
}

interface EvidenceSectionProps {
  marketId?: number;
}

export function EvidenceSection({ marketId }: EvidenceSectionProps) {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    content: "",
    evidenceType: "yes" as "yes" | "no"
  });
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'yes' | 'no' | 'submit'>('yes');

  const { data: evidence = [], refetch: refetchEvidence, error: evidenceError } = useQuery<Evidence[]>({
    queryKey: ['evidence', marketId, activeTab],
    queryFn: async () => {
      console.log('🔍 Fetching evidence:', { marketId, activeTab });
      
      const params = new URLSearchParams();
      if (marketId) params.set('marketId', marketId.toString());
      if (activeTab === 'yes' || activeTab === 'no') params.set('type', activeTab);
      
      const url = `/api/evidence?${params.toString()}`;
      console.log('📡 Fetching from URL:', url);
      
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ Failed to fetch evidence:', errorData);
        throw new Error(JSON.stringify(errorData));
      }
      
      const data = await res.json();
      console.log('✅ Fetched evidence:', {
        count: data.length,
        types: data.map((e: Evidence) => e.evidenceType),
        data
      });
      return data;
    },
    enabled: !!marketId && activeTab !== 'submit'
  });

  const submitEvidence = useMutation({
    mutationFn: async () => {
      const submissionData = {
        marketId,
        title: formData.title,
        content: formData.content,
        text: formData.content,
        url: formData.url,
        evidenceType: formData.evidenceType
      };
      
      console.log('🚀 Starting evidence submission with data:', submissionData);

      const res = await fetch("/api/evidence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Evidence submission failed:', errorText);
        throw new Error(`Failed to submit evidence: ${errorText}`);
      }

      const responseData = await res.json();
      console.log('✅ Evidence submission successful! Response:', responseData);
      return responseData;
    },
    onSuccess: async () => {
      console.log('📝 Form reset and refreshing data...');
      setFormData({
        title: "",
        url: "",
        content: "",
        evidenceType: "yes"
      });
      
      console.log('🔄 Invalidating queries and refetching...');
      await queryClient.invalidateQueries({ queryKey: ['evidence', marketId, activeTab] });
      await refetchEvidence();
      
      console.log('📊 Current evidence state:', {
        all: evidence,
        yes: evidence.filter(e => e.evidenceType === 'yes'),
        no: evidence.filter(e => e.evidenceType === 'no')
      });
    },
    onError: (error) => {
      console.error('❌ Evidence submission error:', error);
    }
  });

  const voteOnEvidence = useMutation({
    mutationFn: async ({ evidenceId, value }: { evidenceId: number; value: number }) => {
      console.log('🗳️ Starting vote submission:', { evidenceId, value });
      
      try {
        const res = await fetch(`/api/evidence/${evidenceId}/vote`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value }),
          credentials: 'include', // Include cookies if using sessions
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ Vote request failed:', errorText);
          throw new Error(`Failed to vote: ${errorText}`);
        }

        const data = await res.json();
        console.log('✅ Vote submitted successfully:', data);
        return data;
      } catch (error) {
        console.error('❌ Vote request error:', error);
        throw error;
      }
    },
    onSuccess: async (data) => {
      console.log('🔄 Vote recorded, refreshing evidence...');
      await queryClient.invalidateQueries({ queryKey: ['evidence', marketId, activeTab] });
      await refetchEvidence();
      console.log('✨ Evidence refreshed after vote');
    },
    onError: (error) => {
      console.error('❌ Vote mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleVote = async (evidenceId: number, value: number) => {
    console.log('👆 Vote button clicked:', { evidenceId, value });
    try {
      await voteOnEvidence.mutate({ evidenceId, value });
    } catch (error) {
      console.error('Failed to submit vote:', error);
    }
  };

  useEffect(() => {
    if (evidenceError) {
      console.error('🚨 Evidence query error:', evidenceError);
    }
    console.log('📊 Current evidence state:', {
      marketId,
      error: evidenceError,
      dataLength: evidence?.length,
      data: evidence
    });
  }, [evidence, evidenceError, marketId]);

  const yesEvidence = evidence?.filter(e => e.evidenceType === 'yes') || [];
  const noEvidence = evidence?.filter(e => e.evidenceType === 'no') || [];
  
  console.log('Filtered evidence:', {
    yes: yesEvidence,
    no: noEvidence
  });

  // Add a function to calculate net votes
  const calculateNetVotes = (item: Evidence) => {
    const upvotes = item.votes?.filter(v => v.value > 0).length || 0;
    const downvotes = item.votes?.filter(v => v.value < 0).length || 0;
    return upvotes - downvotes;
  };

  const EvidenceList = ({ items }: { items: Evidence[] }) => {
    console.log('🎯 Rendering evidence list:', {
      itemCount: items.length,
      types: items.map(i => i.evidenceType)
    });

    return (
      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No evidence found</p>
        ) : (
          items.map((item, index) => {
            const netVotes = calculateNetVotes(item);
            const hasUpvoted = item.votes?.some(v => v.value > 0) || false;
            const hasDownvoted = item.votes?.some(v => v.value < 0) || false;

            return (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center min-w-[40px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        console.log('⬆️ Upvote clicked for evidence:', item.id);
                        handleVote(item.id, hasUpvoted ? 0 : 1);
                      }}
                      disabled={voteOnEvidence.isLoading}
                      className="p-0 h-6 hover:bg-transparent"
                    >
                      <ArrowBigUp 
                        className={cn(
                          "h-6 w-6 transition-colors",
                          hasUpvoted ? "text-orange-500 fill-orange-500" : "text-gray-500 hover:text-orange-500"
                        )}
                      />
                    </Button>
                    
                    <span className={cn(
                      "font-medium text-sm",
                      netVotes > 0 ? "text-orange-500" : 
                      netVotes < 0 ? "text-blue-500" : 
                      "text-gray-500"
                    )}>
                      {netVotes}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        console.log('⬇️ Downvote clicked for evidence:', item.id);
                        handleVote(item.id, hasDownvoted ? 0 : -1);
                      }}
                      disabled={voteOnEvidence.isLoading}
                      className="p-0 h-6 hover:bg-transparent"
                    >
                      <ArrowBigDown 
                        className={cn(
                          "h-6 w-6 transition-colors",
                          hasDownvoted ? "text-blue-500 fill-blue-500" : "text-gray-500 hover:text-blue-500"
                        )}
                      />
                    </Button>
                  </div>

                  {/* Content section */}
                  <div className="flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">#{index + 1}</span>
                        <span className="font-medium">{item.title}</span>
                      </div>
                      {item.url && (
                        <a href={item.url} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline text-sm block">
                          Source Document
                        </a>
                      )}
                      <p className="text-gray-600">{item.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">Evidence</h2>
        
        <Tabs defaultValue="yes" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="yes">View "Yes" Documents</TabsTrigger>
            <TabsTrigger value="no">View "No" Documents</TabsTrigger>
            <TabsTrigger value="submit">Submit Evidence</TabsTrigger>
          </TabsList>

          <TabsContent value="yes" className="mt-4">
            <EvidenceList items={evidence.filter(e => e.evidenceType === 'yes')} />
          </TabsContent>

          <TabsContent value="no" className="mt-4">
            <EvidenceList items={evidence.filter(e => e.evidenceType === 'no')} />
          </TabsContent>

          <TabsContent value="submit" className="mt-4">
            <form onSubmit={(e) => {
              e.preventDefault();
              submitEvidence.mutate();
            }}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-base font-medium">Evidence Type</h3>
                  <RadioGroup
                    value={formData.evidenceType}
                    onValueChange={(value: "yes" | "no") => 
                      setFormData(prev => ({ ...prev, evidenceType: value }))}
                    className="flex gap-4"
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
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    placeholder="Enter the URL of the document..."
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text">Text</Label>
                  <Textarea
                    id="text"
                    placeholder="Enter the document text or analysis..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-[150px]"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#0f172a] hover:bg-[#1e293b]"
                  disabled={submitEvidence.isLoading || !formData.title || !formData.content}
                >
                  Submit Evidence
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 