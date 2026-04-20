"use client";

import { useStudioStore } from "@/lib/store";
import { LayersPanel } from "@/components/panels/LayersPanel";
import { Canvas } from "@/components/panels/Canvas";
import { PropertiesPanel } from "@/components/panels/PropertiesPanel";
import { HandoffPanel } from "@/components/panels/HandoffPanel";
import { Code2, Palette } from "lucide-react";

export default function Home() {
  const { viewMode, setViewMode, mode } = useStudioStore();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-panel">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <h1 className="font-semibold">Motion Studio</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* View mode toggle */}
          <div className="flex bg-border rounded-md p-0.5">
            <button
              onClick={() => setViewMode("designer")}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                viewMode === "designer"
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Palette className="w-4 h-4" />
              Designer
            </button>
            <button
              onClick={() => setViewMode("developer")}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                viewMode === "developer"
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Code2 className="w-4 h-4" />
              Handoff
            </button>
          </div>

          {viewMode === "designer" && (
            <span className="text-xs text-muted px-2 py-1 bg-border rounded">
              {mode === "simple" ? "Simple" : "Advanced"} Mode
            </span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {viewMode === "designer" ? (
          <div className="h-full grid grid-cols-[240px_1fr_300px]">
            <LayersPanel />
            <Canvas />
            <PropertiesPanel />
          </div>
        ) : (
          <HandoffPanel />
        )}
      </main>
    </div>
  );
}
