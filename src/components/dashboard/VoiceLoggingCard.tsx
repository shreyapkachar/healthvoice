import { useState, useEffect } from "react";
import { Mic, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type RecordingState = "idle" | "recording" | "processing" | "success" | "error";

export interface HealthAnalysis {
  symptoms: string[];
  medications: { name: string; timing: string }[];
  mental_state: string;
  lifestyle_notes: string[];
  severity: "low" | "medium" | "high";
  doctor_summary: string;
  raw_transcript: string;
}

interface VoiceLoggingCardProps {
  onAnalysisComplete?: (analysis: HealthAnalysis) => void;
}

export function VoiceLoggingCard({ onAnalysisComplete }: VoiceLoggingCardProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const { transcript, isListening, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Log support status on mount
  useEffect(() => {
    console.log("Speech Recognition supported:", isSupported);
    console.log("Current listening state:", isListening);
  }, [isSupported, isListening]);

  // Sync recording state with isListening
  useEffect(() => {
    if (isListening && state === "idle") {
      setState("recording");
    }
  }, [isListening, state]);

  const analyzeTranscript = async (text: string) => {
    setState("processing");
    
    try {
      const { data, error } = await supabase.functions.invoke("analyze-health", {
        body: { transcript: text },
      });

      if (error) {
        console.error("Analysis error:", error);
        throw new Error(error.message || "Failed to analyze health data");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setState("success");
      
      toast({
        title: "Health Update Analyzed",
        description: `Detected ${data.symptoms?.length || 0} symptoms and ${data.medications?.length || 0} medications.`,
      });

      if (onAnalysisComplete) {
        onAnalysisComplete(data as HealthAnalysis);
      }

      // Navigate to voice analysis page with the data
      setTimeout(() => {
        navigate("/voice-analysis", { state: { analysis: data } });
        setState("idle");
        resetTranscript();
      }, 1500);

    } catch (error) {
      console.error("Error analyzing transcript:", error);
      setState("error");
      
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unable to analyze your health update. Please try again.",
        variant: "destructive",
      });

      setTimeout(() => {
        setState("idle");
      }, 2000);
    }
  };

  const handleClick = () => {
    console.log("Button clicked, current state:", state, "isSupported:", isSupported, "isListening:", isListening);
    
    if (!isSupported) {
      console.log("Speech not supported in this browser");
      toast({
        title: "Speech Not Supported",
        description: "Your browser doesn't support voice input. Please try Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }

    if (state === "idle") {
      console.log("Starting listening...");
      try {
        startListening();
        setState("recording");
        toast({
          title: "Listening...",
          description: "Speak clearly about your health. Tap again when done.",
        });
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast({
          title: "Microphone Error",
          description: "Could not access microphone. Please allow microphone permissions.",
          variant: "destructive",
        });
      }
    } else if (state === "recording") {
      console.log("Stopping listening, transcript:", transcript);
      stopListening();
      if (transcript.trim()) {
        analyzeTranscript(transcript);
      } else {
        toast({
          title: "No Speech Detected",
          description: "Please speak about your health before stopping the recording.",
          variant: "destructive",
        });
        setState("idle");
      }
    }
  };

  const getIcon = () => {
    switch (state) {
      case "processing":
        return <Loader2 className="h-12 w-12 animate-spin" />;
      case "success":
        return <CheckCircle className="h-12 w-12" />;
      case "error":
        return <AlertCircle className="h-12 w-12" />;
      default:
        return <Mic className={cn("h-12 w-12", state === "recording" && "animate-pulse")} />;
    }
  };

  const getStatusText = () => {
    switch (state) {
      case "idle":
        return "Tap and speak about your health today";
      case "recording":
        return "Listening... Tap again to stop";
      case "processing":
        return "Analyzing your voice input...";
      case "success":
        return "Analysis complete!";
      case "error":
        return "Something went wrong. Try again.";
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-medical-blue-dark p-8 text-primary-foreground card-shadow animate-fade-in">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative flex flex-col items-center text-center">
        <h3 className="text-xl font-semibold mb-2">Add Health Update</h3>
        <p className="text-primary-foreground/80 mb-8 max-w-md">
          Record your daily health experiences using voice. We'll automatically organize your symptoms, medications, and insights.
        </p>

        {/* Microphone Button */}
        <div className="relative mb-6">
          {/* Ripple Effect for Recording */}
          {state === "recording" && (
            <>
              <div className="absolute inset-0 rounded-full bg-primary-foreground/20 animate-ripple" />
              <div className="absolute inset-0 rounded-full bg-primary-foreground/20 animate-ripple" style={{ animationDelay: "0.5s" }} />
            </>
          )}

          <button
            onClick={handleClick}
            disabled={state === "processing" || state === "success"}
            className={cn(
              "relative flex h-28 w-28 items-center justify-center rounded-full transition-all duration-300",
              "bg-primary-foreground/20 hover:bg-primary-foreground/30",
              "border-4 border-primary-foreground/40",
              state === "recording" && "animate-pulse-glow bg-primary-foreground/30",
              state === "success" && "bg-green-500/30 border-green-400/40",
              state === "error" && "bg-red-500/30 border-red-400/40",
              (state === "processing" || state === "success") && "opacity-80 cursor-not-allowed"
            )}
          >
            {getIcon()}
          </button>
        </div>

        {/* Transcript Preview */}
        {(state === "recording" || state === "processing") && transcript && (
          <div className="mb-4 max-w-md p-3 rounded-lg bg-primary-foreground/10 backdrop-blur-sm">
            <p className="text-sm text-primary-foreground/90 italic">"{transcript}"</p>
          </div>
        )}

        {/* Status Text */}
        <p className="text-sm font-medium">{getStatusText()}</p>

        {!isSupported && (
          <p className="mt-2 text-xs text-primary-foreground/60">
            Voice input requires Chrome, Edge, or Safari browser
          </p>
        )}
      </div>
    </div>
  );
}
