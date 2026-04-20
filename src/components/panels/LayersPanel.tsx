"use client";

import { useState } from "react";
import { useStudioStore } from "@/lib/store";
import { Layers, Plus, Image, PenTool, Trash2, Upload, Sparkles, Code } from "lucide-react";
import { FigmaImport } from "@/components/FigmaImport";
import { ImageUpload } from "@/components/ImageUpload";

export function LayersPanel() {
  const { layers, selectedLayerId, selectLayer, addLayer, removeLayer } = useStudioStore();
  const [showFigmaImport, setShowFigmaImport] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleAddPlaceholder = () => {
    addLayer({
      name: `Layer ${layers.length + 1}`,
      type: "placeholder",
      motion: useStudioStore.getState().layers[0]?.motion || ({} as any),
    });
  };

  return (
    <div className="h-full flex flex-col bg-panel border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Layers
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {layers.map((layer) => (
          <div
            key={layer.id}
            onClick={() => selectLayer(layer.id)}
            className={`group w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors cursor-pointer ${
              selectedLayerId === layer.id
                ? "bg-accent/20 text-accent"
                : "hover:bg-border text-foreground"
            }`}
          >
            {layer.type === "figma" ? (
              <PenTool className="w-4 h-4 flex-shrink-0" />
            ) : layer.type === "image" ? (
              <Image className="w-4 h-4 flex-shrink-0" />
            ) : layer.type === "generated" ? (
              <Sparkles className="w-4 h-4 flex-shrink-0 text-accent" />
            ) : (
              <div className="w-4 h-4 rounded bg-accent/50 flex-shrink-0" />
            )}
            <span className="flex-1 truncate">{layer.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeLayer(layer.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border space-y-2">
        <button
          onClick={() => setShowImageUpload(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          AI Analyze Image
        </button>
        <button
          onClick={() => setShowFigmaImport(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-border hover:bg-border/80 rounded-md text-sm transition-colors"
        >
          <PenTool className="w-4 h-4" />
          Import from Figma
        </button>
        <button
          onClick={handleAddPlaceholder}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-border hover:bg-border/80 rounded-md text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Placeholder
        </button>
      </div>

      {showFigmaImport && <FigmaImport onClose={() => setShowFigmaImport(false)} />}
      {showImageUpload && <ImageUpload onClose={() => setShowImageUpload(false)} />}
    </div>
  );
}
