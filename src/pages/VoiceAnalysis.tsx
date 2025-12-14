import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  FileText, 
  Activity, 
  Pill, 
  Brain, 
  Heart, 
  Copy, 
  Download, 
  Edit, 
  Save,
  Check,
  Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import type { HealthAnalysis } from "@/components/dashboard/VoiceLoggingCard";

const defaultAnalysisData = {
  raw_transcript: "I woke up this morning with a mild headache on the left side. Took my blood pressure medication around 8 AM with breakfast. Feeling a bit anxious about my doctor's appointment tomorrow. Had a light lunch and went for a 20-minute walk. The headache went away after lunch. Overall energy level is moderate today.",
  symptoms: ["Headache (left side)", "Fatigue"],
  medications: [
    { name: "Blood Pressure Medication", timing: "8:00 AM with breakfast" },
  ],
  mental_state: "Slightly Anxious",
  lifestyle_notes: ["20-minute walk after lunch", "Light lunch consumed"],
  severity: "low" as const,
  doctor_summary: "Patient reports a mild left-sided headache upon waking that resolved after lunch. Blood pressure medication taken as prescribed at 8:00 AM with breakfast. Patient expresses moderate anxiety regarding an upcoming medical appointment. Physical activity included a 20-minute walk. Overall energy described as moderate. Recommend continued medication adherence and stress management techniques prior to appointment.",
};

export default function VoiceAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  // Get analysis from navigation state or use default
  const analysisData: HealthAnalysis = location.state?.analysis || defaultAnalysisData;

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleExportPDF = () => {
    toast.success("PDF export started. Download will begin shortly.");
  };

  const handleNewRecording = () => {
    navigate("/dashboard");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Voice Analysis</h1>
            <p className="text-sm text-muted-foreground">Your voice input converted to structured medical data</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleNewRecording}>
              <Mic className="h-4 w-4 mr-2" />
              New Recording
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Summary
            </Button>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Entry
            </Button>
            <Button size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Transcribed Voice Text */}
          <div className="rounded-2xl bg-card border border-border p-6 card-shadow animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Voice Transcript</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(analysisData.raw_transcript, "transcript")}
              >
                {copiedSection === "transcript" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-4 rounded-lg">
              "{analysisData.raw_transcript}"
            </p>
            <p className="text-xs text-muted-foreground mt-3">Recorded today at {new Date().toLocaleTimeString()}</p>
          </div>

          {/* Symptoms Detected */}
          <div className="rounded-2xl bg-card border border-border p-6 card-shadow animate-fade-in" style={{ animationDelay: "50ms" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Symptoms Detected</h3>
            </div>
            <div className="space-y-3">
              {analysisData.symptoms.length > 0 ? (
                analysisData.symptoms.map((symptom, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <p className="text-sm font-medium text-foreground">{symptom}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      analysisData.severity === "high" 
                        ? "bg-red-100 text-red-700" 
                        : analysisData.severity === "medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {analysisData.severity}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No symptoms detected</p>
              )}
            </div>
          </div>

          {/* Medications & Timing */}
          <div className="rounded-2xl bg-card border border-border p-6 card-shadow animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Medications & Timing</h3>
            </div>
            <div className="space-y-3">
              {analysisData.medications.length > 0 ? (
                analysisData.medications.map((med, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">{med.name}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {med.timing}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No medications logged</p>
              )}
            </div>
          </div>

          {/* Mental & Emotional State */}
          <div className="rounded-2xl bg-card border border-border p-6 card-shadow animate-fade-in" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Mental & Emotional State</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current State</span>
                <span className="text-sm font-medium text-foreground px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {analysisData.mental_state || "Not detected"}
                </span>
              </div>
            </div>
          </div>

          {/* Lifestyle Context */}
          <div className="rounded-2xl bg-card border border-border p-6 card-shadow animate-fade-in lg:col-span-2" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Lifestyle Context</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {analysisData.lifestyle_notes.length > 0 ? (
                analysisData.lifestyle_notes.map((note, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium text-foreground">{note}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic col-span-4">No lifestyle notes detected</p>
              )}
            </div>
          </div>
        </div>

        {/* Doctor-Ready Summary */}
        <div className="rounded-2xl bg-card border-2 border-primary/20 p-6 card-shadow animate-fade-in" style={{ animationDelay: "250ms" }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Doctor-Ready Summary</h3>
                <p className="text-xs text-muted-foreground">Professional clinical format</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(analysisData.doctor_summary, "summary")}
              >
                {copiedSection === "summary" ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Summary
                  </>
                )}
              </Button>
              <Button size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF for Doctor
              </Button>
            </div>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <p className="text-sm text-foreground leading-relaxed">{analysisData.doctor_summary}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Generated from voice input on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
