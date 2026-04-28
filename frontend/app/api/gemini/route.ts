import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const enhancedPrompt = prompt + "\n\nReturn ONLY a valid JSON object. Do not include markdown formatting like ```json or ```.";

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();

    // Clean up any potential markdown
    const parsedText = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    return NextResponse.json(JSON.parse(parsedText));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    const errorMessage = error.message || "Unknown AI Error";
    const isQuotaError = errorMessage.toLowerCase().includes("quota") || errorMessage.toLowerCase().includes("429");

    return NextResponse.json({
      risk: "Error",
      reason: isQuotaError ? "Gemini API Quota reached. Please try again later." : `AI Error: ${errorMessage}`,
      suggestion: "Check your Gemini API usage or try again in a moment.",
      optimizedRoute: []
    }, { status: isQuotaError ? 429 : 500 });
  }
}
