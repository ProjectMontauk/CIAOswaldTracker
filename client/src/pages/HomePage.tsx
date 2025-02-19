import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary">Kane Inquirer</h2>
              <p className="text-sm text-muted-foreground">Question Everything</p>
            </div>
            <Link href="/markets/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Market
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Welcome to Kane Inquirer</h1>
            <p className="text-xl text-muted-foreground">
              Question Everything
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
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
                <Link href="/markets/create">
                  <Button variant="secondary" className="w-3/4 mx-auto block">Create Market</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}