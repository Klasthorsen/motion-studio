import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const SYSTEM_PROMPT = `You are a UI/UX expert that analyzes component images and generates HTML prototypes.

When given an image of a UI component, you will:
1. Generate clean, semantic HTML with Tailwind CSS classes that RECREATES the visual appearance
2. Identify the component type (button, card, input, etc.)
3. Suggest appropriate states (hover, active, focus, disabled)
4. Recommend motion animations for each state

CRITICAL RULES for HTML:
- NEVER use <img> tags - the original image is not available at runtime
- For image placeholders, use a <div> with Tailwind bg-gradient or solid color
- For icons, use inline SVG or Tailwind-styled divs (e.g., emoji like ⭐ 🔔 ✓)
- Use Tailwind CSS classes ONLY (no custom CSS needed in most cases)
- Recreate the visual style: colors, spacing, borders, shadows, typography
- Use placeholder text content that matches what you see ("Sign Up", "Welcome back", etc.)
- Make it interactive: add button/input/link elements as appropriate
- The component should LOOK like the image, using pure HTML + Tailwind

Respond ONLY with valid JSON in this exact format:
{
  "componentType": "button|card|input|modal|nav|other",
  "componentName": "Descriptive name",
  "html": "<div class='p-6 bg-white rounded-lg shadow-md'>...</div>",
  "css": "",
  "states": [
    {
      "name": "default",
      "description": "Initial state",
      "motion": {
        "preset": "fadeIn",
        "duration": 0.3,
        "ease": "easeOut"
      }
    },
    {
      "name": "hover",
      "description": "Mouse hover state",
      "cssChanges": "scale-105 shadow-lg",
      "motion": {
        "preset": "scaleIn",
        "duration": 0.2,
        "ease": "easeOut"
      }
    }
  ],
  "recommendations": [
    {
      "preset": "scaleIn",
      "reason": "Subtle scale adds depth on interaction",
      "confidence": "high"
    }
  ]
}

Available motion presets: fadeIn, slideUp, slideDown, slideLeft, slideRight, scaleIn, bounce, rotate

Keep HTML clean and focused. The HTML must render correctly WITHOUT any external images.`;

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  try {
    const { image, name } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: name 
                ? `Analyze this UI component called "${name}" and generate an HTML prototype with states and motion recommendations.`
                : "Analyze this UI component and generate an HTML prototype with states and motion recommendations.",
            },
            {
              type: "image_url",
              image_url: {
                url: image.startsWith("data:") ? image : `data:image/png;base64,${image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const result = JSON.parse(jsonStr.trim());

    return NextResponse.json(result);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze image" },
      { status: 500 }
    );
  }
}
