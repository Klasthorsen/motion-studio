"use client";

import { useState } from "react";
import { useStudioStore } from "@/lib/store";
import { X, Loader2, ExternalLink } from "lucide-react";

interface FigmaImportProps {
  onClose: () => void;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  imageUrl?: string | null;
}

export function FigmaImport({ onClose }: FigmaImportProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<FigmaNode[]>([]);
  const [fileName, setFileName] = useState("");
  const { addLayer } = useStudioStore();

  const parseFigmaUrl = (url: string): { fileKey: string; nodeId?: string } | null => {
    // https://www.figma.com/design/FILEKEY/FileName?node-id=123-456
    // https://www.figma.com/file/FILEKEY/FileName
    const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
    if (!match) return null;

    const fileKey = match[1];
    const nodeIdMatch = url.match(/node-id=([0-9]+-[0-9]+)/);
    const nodeId = nodeIdMatch ? nodeIdMatch[1].replace("-", ":") : undefined;

    return { fileKey, nodeId };
  };

  const handleFetch = async () => {
    const parsed = parseFigmaUrl(url);
    if (!parsed) {
      setError("Invalid Figma URL. Please use a file or design URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setNodes([]);

    try {
      const params = new URLSearchParams({ fileKey: parsed.fileKey });
      if (parsed.nodeId) params.set("nodeId", parsed.nodeId);

      const res = await fetch(`/api/figma?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch");
      }

      setFileName(data.name);
      setNodes(data.nodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch from Figma");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = (node: FigmaNode) => {
    addLayer({
      name: node.name,
      type: "figma",
      src: node.imageUrl || undefined,
      motion: useStudioStore.getState().layers[0]?.motion || ({} as any),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-panel border border-border rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Import from Figma</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          {/* URL Input */}
          <div className="space-y-2 mb-4">
            <label className="text-sm text-muted">Figma URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.figma.com/design/..."
                className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={handleFetch}
                disabled={loading || !url}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch"}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          {/* Info */}
          {!nodes.length && !loading && (
            <div className="text-sm text-muted space-y-2">
              <p>Paste a Figma file or frame URL to import components.</p>
              <p className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Requires FIGMA_ACCESS_TOKEN in environment variables.
              </p>
            </div>
          )}

          {/* File name */}
          {fileName && (
            <div className="mb-3">
              <span className="text-sm text-muted">File: </span>
              <span className="text-sm font-medium">{fileName}</span>
            </div>
          )}

          {/* Nodes list */}
          {nodes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-muted">
                Select a component to import ({nodes.length} found)
              </label>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {nodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => handleImport(node)}
                    className="w-full flex items-center gap-3 p-2 bg-background hover:bg-border rounded-md text-left transition-colors"
                  >
                    {node.imageUrl ? (
                      <img
                        src={node.imageUrl}
                        alt={node.name}
                        className="w-10 h-10 object-contain bg-white rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-border rounded flex items-center justify-center text-xs text-muted">
                        {node.type[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{node.name}</div>
                      <div className="text-xs text-muted">{node.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
