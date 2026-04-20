"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useStudioStore } from "@/lib/store";
import {
  generateMotionReact,
  generateMotionVue,
  generateCSS,
  generateGSAP,
  generateJSON,
  generateMultiStateReact,
  generateMultiStateCSS,
} from "@/lib/code-generator";
import { Copy, Check, Download, ArrowLeft } from "lucide-react";

type ExportFormat = "react" | "vue" | "css" | "gsap" | "json";

export function HandoffPanel() {
  const { layers, selectedLayerId, setViewMode } = useStudioStore();
  const [activeTab, setActiveTab] = useState<ExportFormat>("react");
  const [copied, setCopied] = useState(false);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  if (!selectedLayer) {
    return (
      <div className="h-full flex items-center justify-center text-muted">
        Select a layer to export
      </div>
    );
  }

  const { motion, states } = selectedLayer;
  const hasMultipleStates = states && states.length > 1;

  const codeOutputs: Record<ExportFormat, string> = {
    react: hasMultipleStates 
      ? generateMultiStateReact(selectedLayer)
      : generateMotionReact(motion, selectedLayer.name.replace(/\s/g, "")),
    vue: generateMotionVue(motion),
    css: hasMultipleStates
      ? generateMultiStateCSS(selectedLayer)
      : generateCSS(motion, selectedLayer.name.toLowerCase().replace(/\s/g, "-")),
    gsap: generateGSAP(motion, `.${selectedLayer.name.toLowerCase().replace(/\s/g, "-")}`),
    json: hasMultipleStates 
      ? JSON.stringify({ states, defaultMotion: motion }, null, 2)
      : generateJSON(motion),
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeOutputs[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([codeOutputs.json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedLayer.name.toLowerCase().replace(/\s/g, "-")}-motion.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <button
          onClick={() => setViewMode("designer")}
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Designer
        </button>
        <h2 className="text-sm font-semibold">Handoff: {selectedLayer.name}</h2>
      </div>

      {/* Tabs */}
      <Tabs.Root
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ExportFormat)}
        className="flex-1 flex flex-col"
      >
        <Tabs.List className="flex border-b border-border">
          {(["react", "vue", "css", "gsap", "json"] as ExportFormat[]).map((tab) => (
            <Tabs.Trigger
              key={tab}
              value={tab}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab === "react"
                ? "React"
                : tab === "vue"
                  ? "Vue"
                  : tab === "css"
                    ? "CSS"
                    : tab === "gsap"
                      ? "GSAP"
                      : "JSON"}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Code area */}
          <div className="flex-1 overflow-auto p-4">
            <pre className="text-sm font-mono bg-panel p-4 rounded-lg overflow-x-auto">
              <code>{codeOutputs[activeTab]}</code>
            </pre>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-border flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Code"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-border hover:bg-border/80 rounded-md text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download JSON
            </button>
          </div>
        </div>
      </Tabs.Root>

      {/* Specs summary */}
      <div className="p-4 border-t border-border">
        <h3 className="text-xs text-muted uppercase tracking-wide mb-3">Specs for Developer</h3>
        
        {hasMultipleStates && (
          <div className="mb-4">
            <div className="text-xs text-accent mb-2">Component States: {states.length}</div>
            <div className="flex flex-wrap gap-2">
              {states.map((s) => (
                <span key={s.name} className="px-2 py-1 bg-panel rounded text-xs capitalize">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-panel p-3 rounded-md">
            <div className="text-muted text-xs mb-1">Duration</div>
            <div className="font-mono">{motion.transition.duration}s</div>
          </div>
          <div className="bg-panel p-3 rounded-md">
            <div className="text-muted text-xs mb-1">Easing</div>
            <div className="font-mono">{motion.transition.ease}</div>
          </div>
          <div className="bg-panel p-3 rounded-md">
            <div className="text-muted text-xs mb-1">Delay</div>
            <div className="font-mono">{motion.transition.delay}s</div>
          </div>
          <div className="bg-panel p-3 rounded-md">
            <div className="text-muted text-xs mb-1">Opacity</div>
            <div className="font-mono">
              {motion.initial.opacity} → {motion.animate.opacity}
            </div>
          </div>
          <div className="bg-panel p-3 rounded-md">
            <div className="text-muted text-xs mb-1">Y Offset</div>
            <div className="font-mono">
              {motion.initial.y}px → {motion.animate.y}px
            </div>
          </div>
          <div className="bg-panel p-3 rounded-md">
            <div className="text-muted text-xs mb-1">Scale</div>
            <div className="font-mono">
              {motion.initial.scale} → {motion.animate.scale}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
