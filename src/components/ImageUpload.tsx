"use client";

import { useState, useCallback } from "react";
import { useStudioStore, type ComponentState, type MotionConfig, type EasingType } from "@/lib/store";
import { Upload, X, Loader2, Sparkles } from "lucide-react";

interface ImageUploadProps {
  onClose: () => void;
}

interface AnalysisResult {
  componentType: string;
  componentName: string;
  html: string;
  css: string;
  states: {
    name: string;
    description: string;
    cssChanges?: string;
    motion: {
      preset: string;
      duration: number;
      ease: string;
    };
  }[];
  recommendations: {
    preset: string;
    reason: string;
    confidence: string;
  }[];
}

const defaultMotionState = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
};

const defaultTransition = {
  duration: 0.3,
  delay: 0,
  ease: "easeOut" as EasingType,
  stagger: 0,
  stiffness: 100,
  damping: 10,
  useSpring: false,
};

function createMotionConfig(preset?: { duration?: number; ease?: string }): MotionConfig {
  return {
    initial: { ...defaultMotionState, opacity: 0 },
    animate: { ...defaultMotionState },
    transition: {
      ...defaultTransition,
      duration: preset?.duration || 0.3,
      ease: (preset?.ease as EasingType) || "easeOut",
    },
    trigger: "mount",
  };
}

export function ImageUpload({ onClose }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { addGeneratedLayer } = useStudioStore();

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Analysis failed");
        }

        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to analyze image");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleImport = () => {
    if (!result) return;

    const states: ComponentState[] = result.states.map((s) => ({
      name: s.name as ComponentState["name"],
      description: s.description,
      cssChanges: s.cssChanges,
      motion: createMotionConfig(s.motion),
    }));

    // Ensure we have at least a default state
    if (!states.find((s) => s.name === "default")) {
      states.unshift({
        name: "default",
        description: "Initial state",
        motion: createMotionConfig(),
      });
    }

    addGeneratedLayer({
      name: result.componentName,
      html: result.html,
      css: result.css,
      states,
      src: preview || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-panel border border-border rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            AI Component Analysis
          </h2>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!preview ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-muted"
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted" />
              <p className="text-lg mb-2">Drop an image here</p>
              <p className="text-sm text-muted mb-4">or</p>
              <label className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium cursor-pointer">
                Browse Files
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </label>
              <p className="text-xs text-muted mt-4">
                Upload a screenshot of a UI component to generate HTML and motion recommendations
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 object-contain bg-white rounded-lg border border-border"
                  />
                </div>
                <div className="flex-1">
                  {loading && (
                    <div className="flex items-center gap-3 text-muted">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing component with AI...</span>
                    </div>
                  )}
                  {error && <p className="text-red-500">{error}</p>}
                  {result && (
                    <div>
                      <h3 className="font-medium text-lg">{result.componentName}</h3>
                      <p className="text-sm text-muted">Type: {result.componentType}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Generated HTML Preview */}
              {result && (
                <>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Generated HTML</h4>
                    <pre className="bg-background p-3 rounded-md text-xs overflow-x-auto max-h-32">
                      <code>{result.html}</code>
                    </pre>
                  </div>

                  {/* States */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Detected States ({result.states.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {result.states.map((state) => (
                        <div
                          key={state.name}
                          className="p-3 bg-background rounded-md"
                        >
                          <div className="font-medium text-sm capitalize">
                            {state.name}
                          </div>
                          <div className="text-xs text-muted">
                            {state.description}
                          </div>
                          <div className="text-xs text-accent mt-1">
                            Motion: {state.motion.preset}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {result.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">AI Recommendations</h4>
                      <div className="space-y-2">
                        {result.recommendations.map((rec, i) => (
                          <div key={i} className="p-3 bg-background rounded-md">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{rec.preset}</span>
                              <span
                                className={`text-xs ${
                                  rec.confidence === "high"
                                    ? "text-green-400"
                                    : rec.confidence === "medium"
                                    ? "text-yellow-400"
                                    : "text-muted"
                                }`}
                              >
                                {rec.confidence}
                              </span>
                            </div>
                            <p className="text-xs text-muted">{rec.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <button
            onClick={() => {
              setPreview(null);
              setResult(null);
              setError(null);
            }}
            className="text-sm text-muted hover:text-foreground"
            disabled={!preview}
          >
            Upload Different Image
          </button>
          <button
            onClick={handleImport}
            disabled={!result || loading}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import Component
          </button>
        </div>
      </div>
    </div>
  );
}
