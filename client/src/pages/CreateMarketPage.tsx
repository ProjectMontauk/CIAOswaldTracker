import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight } from "lucide-react";

type MarketFormData = {
  title: string;
  description: string;
  initialEvidence: string;
  startingOdds: number;
};

const steps = [
  {
    title: "Market Question",
    description: "What question would you like the market to predict?",
  },
  {
    title: "Description",
    description: "Provide more context about the prediction market.",
  },
  {
    title: "Initial Evidence",
    description: "Add any initial evidence or context to help participants.",
  },
  {
    title: "Market Parameters",
    description: "Set the initial market parameters.",
  },
];

export default function CreateMarketPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const form = useForm<MarketFormData>({
    defaultValues: {
      title: "",
      description: "",
      initialEvidence: "",
      startingOdds: 50,
    },
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(current => current + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(current => current - 1);
    }
  };

  const onSubmit = (data: MarketFormData) => {
    console.log(data); // We'll implement the actual submission later
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h2 className="text-2xl font-bold text-primary">Create New Market</h2>
            <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {currentStep === 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="title">Question</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Will Bitcoin reach $100,000 by the end of 2024?"
                      {...form.register("title", { required: true })}
                    />
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="description">Market Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide details about what constitutes a correct prediction..."
                      {...form.register("description", { required: true })}
                      rows={4}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-2">
                    <Label htmlFor="initialEvidence">Initial Evidence</Label>
                    <Textarea
                      id="initialEvidence"
                      placeholder="Share any relevant information, data, or context..."
                      {...form.register("initialEvidence", { required: true })}
                      rows={4}
                    />
                  </div>
                )}

                {currentStep === 3 && (
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
                      })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Set the initial probability between 1% and 99%. This will determine the starting market odds.
                    </p>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <Button
                    type={currentStep === steps.length - 1 ? "submit" : "button"}
                    onClick={currentStep === steps.length - 1 ? undefined : nextStep}
                  >
                    {currentStep === steps.length - 1 ? "Create Market" : "Next"}
                    {currentStep !== steps.length - 1 && (
                      <ArrowRight className="w-4 h-4 ml-2" />
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
