import { NextRequest, NextResponse } from "next/server";

const FIGMA_API = "https://api.figma.com/v1";

export async function GET(request: NextRequest) {
  const token = process.env.FIGMA_ACCESS_TOKEN;
  
  if (!token) {
    return NextResponse.json(
      { error: "Figma access token not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const fileKey = searchParams.get("fileKey");
  const nodeId = searchParams.get("nodeId");

  if (!fileKey) {
    return NextResponse.json(
      { error: "fileKey is required" },
      { status: 400 }
    );
  }

  try {
    // Get file info
    const fileRes = await fetch(`${FIGMA_API}/files/${fileKey}`, {
      headers: { "X-Figma-Token": token },
    });

    if (!fileRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Figma file" },
        { status: fileRes.status }
      );
    }

    const fileData = await fileRes.json();

    // Extract components/frames
    const nodes = extractNodes(fileData.document, nodeId);

    // Get images for the nodes
    const nodeIds = nodes.map((n) => n.id).join(",");
    if (nodeIds) {
      const imagesRes = await fetch(
        `${FIGMA_API}/images/${fileKey}?ids=${nodeIds}&format=png&scale=2`,
        { headers: { "X-Figma-Token": token } }
      );

      if (imagesRes.ok) {
        const imagesData = await imagesRes.json();
        nodes.forEach((node) => {
          node.imageUrl = imagesData.images?.[node.id] || null;
        });
      }
    }

    return NextResponse.json({
      name: fileData.name,
      lastModified: fileData.lastModified,
      nodes,
    });
  } catch (error) {
    console.error("Figma API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Figma" },
      { status: 500 }
    );
  }
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

interface ExtractedNode {
  id: string;
  name: string;
  type: string;
  imageUrl?: string | null;
}

function extractNodes(node: FigmaNode, targetNodeId?: string | null): ExtractedNode[] {
  const results: ExtractedNode[] = [];
  const validTypes = ["FRAME", "COMPONENT", "INSTANCE", "GROUP", "RECTANGLE", "TEXT"];

  function traverse(n: FigmaNode, depth = 0) {
    if (depth > 3) return; // Limit depth

    if (validTypes.includes(n.type)) {
      if (!targetNodeId || n.id === targetNodeId || targetNodeId === "all") {
        results.push({
          id: n.id,
          name: n.name,
          type: n.type,
        });
      }
    }

    if (n.children && results.length < 20) {
      n.children.forEach((child) => traverse(child, depth + 1));
    }
  }

  traverse(node);
  return results;
}
