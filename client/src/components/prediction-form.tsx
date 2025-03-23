import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PredictionFormProps {
  onSubmit: (data: { position: string; amount: number }) => void;
  isLoading: boolean;
}

export function PredictionForm({ onSubmit, isLoading }: PredictionFormProps) {
  const [position, setPosition] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      position,
      amount: parseFloat(amount),
    });
    setPosition("");
    setAmount("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RadioGroup
        value={position}
        onValueChange={setPosition}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="yes" />
          <Label htmlFor="yes">Yes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="no" />
          <Label htmlFor="no">No</Label>
        </div>
      </RadioGroup>

      <Input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <Button type="submit" disabled={isLoading || !position || !amount}>
        {isLoading ? "Submitting..." : "Submit Prediction"}
      </Button>
    </form>
  );
} 