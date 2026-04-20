"use client";

import { useStudioStore } from "@/lib/store";
import { analyzeComponent, getPresetLabel, type MotionRecommendation } from "@/lib/motion-analyzer";
import { Sparkles, Zap, Check } from "lucide-react";
import { useMemo } from "react";

export function MotionRecommendations() {
  const { layers, selectedLayerId, applyPreset } = useStudioStore();
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  const recommendations = useMemo(() => {
    if (!selectedLayer) return [];
    return analyzeComponent(selectedLayer.name, selectedLayer.type);
  }, [selectedLayer]);

  if (!selectedLayer || recommendations.length === 0) {
    return null;
  }

  const confidenceColor = (confidence: MotionRecommendation["confidence"]) => {
    switch (confidence) {
      case "high":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-muted";
    }
  };

  const confidenceIcon = (confidence: MotionRecommendation["confidence"]) => {
    switch (confidence) {
      case "high":
        return <Zap className="w-3 h-3 fill-current" />;
      case "medium":
        return <Zap className="w-3 h-3" />;
      case "low":
        return <Zap className="w-3 h-3 opacity-50" />;
    }
  };

  return (
    <div className="border-t border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-accent" />
        <h3 className="text-xs text-muted uppercase tracking-wide">AI Recommendations</h3>
      </div>
      
      <div className="space-y-2">
        {recommendations.map((rec) => (
          <button
            key={rec.preset}
            onClick={() => applyPreset(selectedLayer.id, rec.preset)}
            className="w-full p-3 bg-background hover:bg-border rounded-lg text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">{getPresetLabel(rec.preset)}</span>
              <span className={`flex items-center gap-1 text-xs ${confidenceColor(rec.confidence)}`}>
                {confidenceIcon(rec.confidence)}
                {rec.confidence}
              </span>
            </div>
            <p className="text-xs text-muted">{rec.reason}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
              <Check className="w-3 h-3" />
              Click to apply
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
